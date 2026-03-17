import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import type { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import * as THREE from 'three'
import {
  extractBuildingData,
  isInsideBuilding,
  IsovistGrid,
  type Vec2,
  type BuildingFootprint,
  type Segment,
} from './isovist'

const SCALE = 5000
const HEIGHT_SCALE = SCALE / 111111

// ── coordinate helper ─────────────────────────────────────────────────────────

function toThreeXZ(geoX: number, geoY: number, centroid: [number, number]): [number, number] {
  return [(geoX - centroid[0]) * SCALE, -(geoY - centroid[1]) * SCALE]
}

// ── data loading ──────────────────────────────────────────────────────────────

interface GeoData {
  buildings: any  // eslint-disable-line @typescript-eslint/no-explicit-any
  streets: any    // eslint-disable-line @typescript-eslint/no-explicit-any
  centroid: [number, number]
  maxRadius: number
  segments: Segment[]
  footprints: BuildingFootprint[]
}

function useGeoData(): GeoData | null {
  const [data, setData] = useState<GeoData | null>(null)
  useEffect(() => {
    Promise.all([
      fetch('./weimar-buildings-3d.geojson').then((r) => r.json()),
      fetch('./weimar-streets.geojson').then((r) => r.json()),
    ]).then(([buildings, streets]) => {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity
      for (const f of buildings.features) {
        for (const poly of f.geometry.coordinates) {
          for (const ring of poly) {
            for (const [x, y] of ring) {
              if (x < minX) minX = x; if (x > maxX) maxX = x
              if (y < minY) minY = y; if (y > maxY) maxY = y
            }
          }
        }
      }
      const centroid: [number, number] = [(minX + maxX) / 2, (minY + maxY) / 2]
      const maxRadius = Math.max(maxX - minX, maxY - minY) * SCALE * 0.9
      const { segments, footprints } = extractBuildingData(buildings, centroid, SCALE)
      setData({ buildings, streets, centroid, maxRadius, segments, footprints })
    })
  }, [])
  return data
}

// ── Buildings ─────────────────────────────────────────────────────────────────

function BuildingMesh({ buildings, centroid }: { buildings: any; centroid: [number, number] }) {
  const geometry = useMemo(() => {
    const positions: number[] = []
    const indices: number[] = []
    let vi = 0
    for (const feature of buildings.features) {
      if (feature.geometry.type !== 'MultiPolygon') continue
      for (const polygon of feature.geometry.coordinates) {
        for (const ring of polygon) {
          if (ring.length < 4) continue
          const pts = ring.slice(0, 4) as [number, number, number][]
          for (const [x, y, z] of pts) {
            const [tx, tz] = toThreeXZ(x, y, centroid)
            positions.push(tx, z * HEIGHT_SCALE, tz)
          }
          indices.push(vi, vi + 1, vi + 2, vi, vi + 2, vi + 3)
          vi += 4
        }
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setIndex(indices)
    geo.computeVertexNormals()
    return geo
  }, [buildings, centroid])

  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial color="white" side={THREE.DoubleSide} />
    </mesh>
  )
}

// ── Streets ───────────────────────────────────────────────────────────────────

function StreetLines({ streets, centroid }: { streets: any; centroid: [number, number] }) {
  const geometry = useMemo(() => {
    const positions: number[] = []
    for (const f of streets.features) {
      const coords = f.geometry.coordinates as [number, number, number][]
      for (let i = 0; i < coords.length - 1; i++) {
        const [x1, z1] = toThreeXZ(coords[i][0], coords[i][1], centroid)
        const [x2, z2] = toThreeXZ(coords[i + 1][0], coords[i + 1][1], centroid)
        positions.push(x1, 0.02, z1, x2, 0.02, z2)
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [streets, centroid])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#bbbbbb" />
    </lineSegments>
  )
}

// ── Isovist polygon ───────────────────────────────────────────────────────────

function IsovistPolygon({ points }: { points: Vec2[] }) {
  const geometry = useMemo(() => {
    if (points.length < 3) return null
    const shape = new THREE.Shape()
    shape.moveTo(points[0][0], points[0][1])
    for (let i = 1; i < points.length; i++) shape.lineTo(points[i][0], points[i][1])
    shape.closePath()
    return new THREE.ShapeGeometry(shape)
  }, [points])

  if (!geometry) return null

  // rotation [+π/2, 0, 0]: shape local Y → world +Z (ground plane)
  return (
    <mesh geometry={geometry} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
      <meshBasicMaterial color="#3b82f6" transparent opacity={0.35} side={THREE.DoubleSide} />
    </mesh>
  )
}

// ── Ground (drag-to-place) ────────────────────────────────────────────────────

interface GroundProps {
  onDragStart: (x: number, z: number) => void
  onDragMove: (x: number, z: number) => void
  onDragEnd: () => void
}

function Ground({ onDragStart, onDragMove, onDragEnd }: GroundProps) {
  const dragging = useRef(false)
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.01, 0]}
      onPointerDown={(e) => {
        e.stopPropagation()
        dragging.current = true
        onDragStart(e.point.x, e.point.z)
      }}
      onPointerMove={(e) => {
        if (!dragging.current) return
        e.stopPropagation()
        onDragMove(e.point.x, e.point.z)
      }}
      onPointerUp={() => {
        dragging.current = false
        onDragEnd()
      }}
    >
      <planeGeometry args={[2000, 2000]} />
      <meshBasicMaterial visible={false} />
    </mesh>
  )
}

// ── Scene ─────────────────────────────────────────────────────────────────────

function Scene({ data }: { data: GeoData }) {
  const { buildings, streets, centroid, maxRadius, segments, footprints } = data
  const [viewpoint, setViewpoint] = useState<Vec2 | null>(null)
  const orbitRef = useRef<OrbitControlsImpl>(null)

  const grid = useMemo(() => new IsovistGrid(segments), [segments])

  const isovistPoints = useMemo(() => {
    if (!viewpoint) return []
    return grid.compute(viewpoint[0], viewpoint[1], maxRadius, 360)
  }, [viewpoint, grid, maxRadius])

  const trySetViewpoint = useCallback(
    (x: number, z: number) => {
      if (!isInsideBuilding(x, z, footprints)) setViewpoint([x, z])
    },
    [footprints]
  )

  const handleDragStart = useCallback(
    (x: number, z: number) => {
      if (orbitRef.current) orbitRef.current.enabled = false
      trySetViewpoint(x, z)
    },
    [trySetViewpoint]
  )

  const handleDragMove = useCallback(
    (x: number, z: number) => {
      trySetViewpoint(x, z)
    },
    [trySetViewpoint]
  )

  const handleDragEnd = useCallback(() => {
    if (orbitRef.current) orbitRef.current.enabled = true
  }, [])

  return (
    <>
      <ambientLight intensity={1.2} />
      <directionalLight position={[50, 100, 50]} intensity={0.5} />

      <BuildingMesh buildings={buildings} centroid={centroid} />
      <StreetLines streets={streets} centroid={centroid} />
      <Ground onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd} />

      {viewpoint && <IsovistPolygon points={isovistPoints} />}

      {viewpoint && (
        <mesh position={[viewpoint[0], 1.5, viewpoint[1]]}>
          <sphereGeometry args={[0.8, 16, 16]} />
          <meshBasicMaterial color="#ef4444" />
        </mesh>
      )}

      <OrbitControls
        ref={orbitRef}
        makeDefault
        mouseButtons={{ LEFT: undefined as any, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.ROTATE }}
      />
    </>
  )
}

// ── App ───────────────────────────────────────────────────────────────────────

export default function App() {
  const data = useGeoData()
  return (
    <div className="w-screen h-screen bg-white relative">
      {!data ? (
        <div className="flex items-center justify-center h-full text-gray-400 text-sm">
          Loading city data…
        </div>
      ) : (
        <>
          <Canvas
            camera={{ position: [0, 60, 40], fov: 50, near: 0.1, far: 5000 }}
            style={{ background: 'white' }}
          >
            <Scene data={data} />
          </Canvas>
          <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur rounded-lg px-4 py-2 text-xs text-gray-500 shadow">
            Click and drag on streets to move viewpoint · Right-drag or scroll to orbit
          </div>
        </>
      )}
    </div>
  )
}
