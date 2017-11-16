import Voronoi from "voronoi"
import Point from "../types/Point"

export type MapPolygon = [Point, Point, Point]

interface Result {
  mapPolygons: MapPolygon[],
  steps: { points: Point[], polygons: Point[][] }[]
}

export default function improvePoints(points: Point[], stepCount = 3): Result {
  const steps = [voroniStep(points)]
  for (var i = 1; i < stepCount; i++) {
    steps.push(voroniStep(steps[i - 1].points))
  }

  return {
    mapPolygons: [],
    steps: steps
  }
}

function voroniStep(previousPoints: Point[]) {
  const result = new Voronoi().compute(previousPoints, { xl: 0, xr: 1000, yt: 0, yb: 1000 })

  const polygons = result.cells.map(cell =>
    cell.halfedges.map(e => e.getStartpoint())
  )

  const points = polygons.map(polygon => centerPoint(polygon))

  return { points, polygons }
}

function centerPoint(points: Point[]): Point {
  const averageX = points.reduce((total, point) => total + point.x, 0) / points.length
  const averageY = points.reduce((total, point) => total + point.y, 0) / points.length

  return { x: averageX, y: averageY }
}
