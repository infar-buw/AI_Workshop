# Workshop Data Files

## Weimar Dataset

Located in `weimar/`. Exported from Rhino via the Heron plugin.

### Coordinate System

Coordinates are in degrees (WGS84) - the Heron plugin converts Rhino's meter coordinates to geographic coordinates during GeoJSON export. However, the coordinates are near the origin (0, 0) rather than at Weimar's actual location (50.98°N, 11.33°E) because the Rhino model uses a local coordinate system. This is fine for visualization - just don't overlay on a real-world basemap without offsetting.

### `weimar-streets.geojson`

Street centerlines from the Weimar dataset. Available for any project that needs road network data.

- **Format:** GeoJSON FeatureCollection (LineString)
- **Properties:**
  - `length` (string) - segment length in meters

### `weimar-buildings.geojson`

Building footprints for Projects A and C.

- **Format:** GeoJSON FeatureCollection (MultiPolygon)
- **Properties:**
  - `Building ID` (string) - unique identifier
  - `Height` (string) - building height in meters
  - `Floors` (string) - number of floors
  - Land use columns (area in m² per use type): `Generic Residential`, `Generic Office Building`, `Generic Light Industrial`, `Generic Service`, `Generic Education`, `Generic Entertainment`, `Generic Retail`, etc.

### `weimar-plots.geojson`

Land parcels / plots.

- **Format:** GeoJSON FeatureCollection (MultiPolygon)
- **Properties:**
  - `landuse` (string) - land use category (e.g. `"Recreation"`)

## Other Files

### `mobility-in-germany.xlsx`

Mobility survey data - can be used for custom analysis projects.

## Data Sources for Further Exploration

- **OpenStreetMap** - [https://overpass-turbo.eu/](https://overpass-turbo.eu/) (export buildings, roads for any location)
- **Berlin 3D CityGML** - [https://www.businesslocationcenter.de/en/economic-atlas/download-portal/](https://www.businesslocationcenter.de/en/economic-atlas/download-portal/)
- **Helsinki 3D** - [https://kartta.hel.fi/3d/](https://kartta.hel.fi/3d/)
- **NASA POWER** - [https://power.larc.nasa.gov/](https://power.larc.nasa.gov/) (solar radiation, no API key needed)
