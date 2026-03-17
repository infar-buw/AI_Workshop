export type Vec2 = [number, number]
export type Segment = [Vec2, Vec2]

// ── Segment & footprint extraction ───────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GeoBuildings = any

function makeTransform(centroid: [number, number], scale: number) {
  return (x: number, y: number): Vec2 => [
    (x - centroid[0]) * scale,
    -(y - centroid[1]) * scale,  // negate y so north = up
  ]
}

export interface BuildingFootprint {
  edges: [Vec2, Vec2][]
  minX: number; minY: number; maxX: number; maxY: number
}

/** Returns all unique wall segments (for ray casting) AND per-building footprints. */
export function extractBuildingData(
  buildings: GeoBuildings,
  centroid: [number, number],
  scale: number
): { segments: Segment[]; footprints: BuildingFootprint[] } {
  const tf = makeTransform(centroid, scale)
  const globalSeen = new Set<string>()
  const segments: Segment[] = []
  const footprints: BuildingFootprint[] = []

  const segKey = (p1: Vec2, p2: Vec2) =>
    p1[0] <= p2[0] || (p1[0] === p2[0] && p1[1] <= p2[1])
      ? `${p1[0].toFixed(3)},${p1[1].toFixed(3)}|${p2[0].toFixed(3)},${p2[1].toFixed(3)}`
      : `${p2[0].toFixed(3)},${p2[1].toFixed(3)}|${p1[0].toFixed(3)},${p1[1].toFixed(3)}`

  for (const feature of buildings.features) {
    if (feature.geometry.type !== 'MultiPolygon') continue

    const featureEdges: [Vec2, Vec2][] = []
    const featureSeen = new Set<string>()          // deduplicate within this building
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    for (const polygon of feature.geometry.coordinates) {
      for (const ring of polygon) {
        // Collect unique 2D positions per face
        const xyMap = new Map<string, Vec2>()
        const unique: Vec2[] = []
        for (const [x, y] of ring) {
          const k = `${x.toFixed(8)},${y.toFixed(8)}`
          if (!xyMap.has(k)) {
            const pt = tf(x, y)
            xyMap.set(k, pt)
            unique.push(pt)
          }
        }
        if (unique.length !== 2) continue
        const [p1, p2] = unique
        const dx = p2[0] - p1[0], dy = p2[1] - p1[1]
        if (dx * dx + dy * dy < 1e-8) continue

        // Per-building footprint edges — deduplicated so each wall edge appears once.
        // Without this, a 4-story building adds the same edge 4 times, making the
        // ray-crossing parity test give the wrong answer (even count → "outside").
        const fk = segKey(p1, p2)
        if (featureSeen.has(fk)) continue
        featureSeen.add(fk)
        featureEdges.push([p1, p2])
        minX = Math.min(minX, p1[0], p2[0]); maxX = Math.max(maxX, p1[0], p2[0])
        minY = Math.min(minY, p1[1], p2[1]); maxY = Math.max(maxY, p1[1], p2[1])

        // Globally deduplicated segments for isovist
        const k = segKey(p1, p2)
        if (!globalSeen.has(k)) {
          globalSeen.add(k)
          segments.push([p1, p2])
        }
      }
    }

    if (featureEdges.length >= 3) {
      footprints.push({ edges: featureEdges, minX, minY, maxX, maxY })
    }
  }

  return { segments, footprints }
}

// ── Point-in-building test ────────────────────────────────────────────────────

export function isInsideBuilding(x: number, y: number, footprints: BuildingFootprint[]): boolean {
  for (const bld of footprints) {
    // Bounding-box quick reject
    if (x < bld.minX || x > bld.maxX || y < bld.minY || y > bld.maxY) continue

    // Ray-cast along +x: count crossings with bottom edges
    let crossings = 0
    for (const [[x1, y1], [x2, y2]] of bld.edges) {
      if ((y1 > y) !== (y2 > y)) {
        const t = (y - y1) / (y2 - y1)
        if (x < x1 + t * (x2 - x1)) crossings++
      }
    }
    if (crossings % 2 === 1) return true
  }
  return false
}

// ── Spatial grid for fast isovist ray casting ─────────────────────────────────

export class IsovistGrid {
  private buf: Float64Array      // packed [x1,y1,x2,y2, ...]
  private cells: Int32Array[]    // cell → segment indices
  private ox: number             // grid origin x
  private oy: number             // grid origin y
  private cs: number             // cell size
  private cols: number
  private rows: number
  private visitGen: Uint32Array  // per-segment visit generation
  private gen = 0

  constructor(segments: Segment[]) {
    const n = segments.length
    this.buf = new Float64Array(n * 4)
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity

    for (let i = 0; i < n; i++) {
      const [[x1, y1], [x2, y2]] = segments[i]
      this.buf[i * 4] = x1; this.buf[i * 4 + 1] = y1
      this.buf[i * 4 + 2] = x2; this.buf[i * 4 + 3] = y2
      if (x1 < minX) minX = x1; if (x2 < minX) minX = x2
      if (y1 < minY) minY = y1; if (y2 < minY) minY = y2
      if (x1 > maxX) maxX = x1; if (x2 > maxX) maxX = x2
      if (y1 > maxY) maxY = y1; if (y2 > maxY) maxY = y2
    }

    const GRID = 40
    const span = Math.max(maxX - minX, maxY - minY) || 1
    this.cs = span / GRID
    this.ox = minX - this.cs
    this.oy = minY - this.cs
    this.cols = Math.ceil((maxX - this.ox) / this.cs) + 2
    this.rows = Math.ceil((maxY - this.oy) / this.cs) + 2

    const lists: number[][] = Array.from({ length: this.cols * this.rows }, () => [])
    for (let i = 0; i < n; i++) {
      this._rasterize(
        this.buf[i * 4], this.buf[i * 4 + 1],
        this.buf[i * 4 + 2], this.buf[i * 4 + 3],
        i, lists
      )
    }
    this.cells = lists.map((l) => new Int32Array(l))
    this.visitGen = new Uint32Array(n)
  }

  private _ci(c: number, r: number) { return r * this.cols + c }

  private _rasterize(x1: number, y1: number, x2: number, y2: number, idx: number, lists: number[][]) {
    let c1 = Math.max(0, Math.min(this.cols - 1, Math.floor((x1 - this.ox) / this.cs)))
    let r1 = Math.max(0, Math.min(this.rows - 1, Math.floor((y1 - this.oy) / this.cs)))
    const c2 = Math.max(0, Math.min(this.cols - 1, Math.floor((x2 - this.ox) / this.cs)))
    const r2 = Math.max(0, Math.min(this.rows - 1, Math.floor((y2 - this.oy) / this.cs)))

    const dc = Math.abs(c2 - c1), dr = Math.abs(r2 - r1)
    const sc = c1 < c2 ? 1 : -1, sr = r1 < r2 ? 1 : -1
    let err = dc - dr

    for (;;) {
      lists[this._ci(c1, r1)].push(idx)
      if (c1 === c2 && r1 === r2) break
      const e2 = 2 * err
      if (e2 > -dr) { err -= dr; c1 += sc }
      if (e2 < dc) { err += dc; r1 += sr }
    }
  }

  castRay(ox: number, oy: number, angle: number, maxDist: number): number {
    const cos = Math.cos(angle)
    const sin = Math.sin(angle)
    const cs = this.cs
    const buf = this.buf
    const gen = ++this.gen
    const vg = this.visitGen

    let cx = Math.floor((ox - this.ox) / cs)
    let cy = Math.floor((oy - this.oy) / cs)

    const stepX = cos >= 0 ? 1 : -1
    const stepY = sin >= 0 ? 1 : -1
    const tDX = Math.abs(cos) < 1e-12 ? Infinity : cs / Math.abs(cos)
    const tDY = Math.abs(sin) < 1e-12 ? Infinity : cs / Math.abs(sin)
    const bX = (cx + (cos >= 0 ? 1 : 0)) * cs + this.ox
    const bY = (cy + (sin >= 0 ? 1 : 0)) * cs + this.oy
    let tMaxX = Math.abs(cos) < 1e-12 ? Infinity : Math.abs((bX - ox) / cos)
    let tMaxY = Math.abs(sin) < 1e-12 ? Infinity : Math.abs((bY - oy) / sin)

    let minT = maxDist

    while (cx >= 0 && cx < this.cols && cy >= 0 && cy < this.rows) {
      const tCell = Math.min(tMaxX, tMaxY)
      if (tCell - cs > minT) break  // all remaining cells are beyond best hit

      const cell = this.cells[this._ci(cx, cy)]
      for (let k = 0; k < cell.length; k++) {
        const si = cell[k]
        if (vg[si] === gen) continue
        vg[si] = gen

        const ax = buf[si * 4], ay = buf[si * 4 + 1]
        const bx = buf[si * 4 + 2], by = buf[si * 4 + 3]
        const ex = bx - ax, ey = by - ay
        const denom = cos * ey - sin * ex
        if (Math.abs(denom) < 1e-10) continue
        const tx = ax - ox, ty = ay - oy
        const t = (tx * ey - ty * ex) / denom
        const s = (tx * sin - ty * cos) / denom
        if (t > 1e-6 && s >= -1e-6 && s <= 1 + 1e-6 && t < minT) minT = t
      }

      if (tMaxX < tMaxY) { cx += stepX; tMaxX += tDX }
      else { cy += stepY; tMaxY += tDY }
    }

    return minT
  }

  compute(ox: number, oy: number, maxDist: number, numRays = 360): Vec2[] {
    const pts: Vec2[] = new Array(numRays)
    const step = (Math.PI * 2) / numRays
    for (let i = 0; i < numRays; i++) {
      const a = i * step
      const t = this.castRay(ox, oy, a, maxDist)
      pts[i] = [ox + Math.cos(a) * t, oy + Math.sin(a) * t]
    }
    return pts
  }
}
