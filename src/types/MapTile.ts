import Point from "./Point"

export type MapPolygon = {
  vertices: [Point, Point, Point],
  center: Point
}

export default interface MapTile extends MapPolygon {
  height: number
}
