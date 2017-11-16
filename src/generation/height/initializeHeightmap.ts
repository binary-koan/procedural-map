import MapTile, { MapPolygon } from "../../types/MapTile"

export default function initializeHeightmap(polygons: MapPolygon[]): MapTile[] {
  return polygons.map(polygon => ({ ...polygon, height: 0 }))
}
