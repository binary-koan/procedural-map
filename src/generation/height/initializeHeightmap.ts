import MapTile, { MapPolygon } from "../../types/MapTile"

export default function initializeHeightmap(polygons: MapPolygon[]): MapTile[] {
  return polygons.map(MapTile.fromPolygon)
}
