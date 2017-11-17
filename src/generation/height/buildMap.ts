import { Map, MapTile, MapPolygon } from "../../types/MapTile"

export default function buildMap(polygons: MapPolygon[], neighbours: { [index: number]: number[] }): Map {
  return new Map(polygons.map(MapTile.fromPolygon), neighbours)
}
