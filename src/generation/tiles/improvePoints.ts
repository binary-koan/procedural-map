import Voronoi, { Diagram } from "voronoi"
import Point from "../../types/Point"
import { MapPolygon } from "../../types/MapTile"

export interface ImproveResult {
  mapPolygons: MapPolygon[],
  neighbours: { [index: number]: number[] }
  steps: { points: Point[], polygons: Point[][] }[]
}

export default function improvePoints(points: Point[], stepCount: number = 3): ImproveResult {
  const steps = [voroniStep(points)]
  for (var i = 1; i < stepCount; i++) {
    steps.push(voroniStep(steps[i - 1].points))
  }

  return {
    ...mapPolygons(steps[steps.length - 1].diagram),
    steps: steps.map(step => ({ points: step.points, polygons: step.polygons }))
  }
}

function voroniStep(previousPoints: Point[]) {
  const result = new Voronoi().compute(previousPoints, { xl: 0, xr: 1500, yt: 0, yb: 1000 })

  const polygons = result.cells.map(cell =>
    cell.halfedges.map(e => e.getStartpoint())
  )

  const points = polygons.map(polygon => centerPoint(polygon))

  return { points, polygons, diagram: result }
}

function centerPoint(points: Point[]) {
  const averageX = points.reduce((total, point) => total + point.x, 0) / points.length
  const averageY = points.reduce((total, point) => total + point.y, 0) / points.length

  return { x: averageX, y: averageY }
}

function mapPolygons(diagram: Diagram) {
  let adjacentPoints = findAdjacents(diagram)

  let triangles = {} as { [id: string]: MapPolygon }

  diagram.edges.forEach(edge => {
    let adjacentToLeft = adjacentPoints.get(edge.lSite) || []
    let adjacentToRight = adjacentPoints.get(edge.rSite) || []

    let thirdPoints = adjacentToLeft.filter(p => adjacentToRight.includes(p))

    thirdPoints.forEach(thirdPoint => {
      let sortedPoints = [edge.lSite, edge.rSite, thirdPoint].sort((a, b) =>
        a.y === b.y ? (a.x - b.x) : (a.y - b.y)
      ) as [Point, Point, Point]
      // Crappy hack to avoid duplication. Why, JS, why?
      triangles[JSON.stringify(sortedPoints)] = { vertices: sortedPoints, center: centerPoint(sortedPoints) }
    })
  })

  const polygons = Object.values(triangles)
  const neighbours = {} as { [index: number]: number[] }

  polygons.forEach((polygon, i) => {
    neighbours[i] = polygons.reduce((polygonNeighbours, p, index) => {
      if (polygon.vertices.filter(v => p.vertices.includes(v)).length > 1) { // TODO 1 or 0?
        return polygonNeighbours.concat([index])
      } else {
        return polygonNeighbours
      }
    }, [] as number[])
  })

  return {
    mapPolygons: polygons,
    neighbours
  }
}

function findAdjacents(diagram: Diagram) {
  let adjacentPoints = new Map() as Map<Point, Point[]>
  diagram.edges.filter(edge => edge.lSite && edge.rSite).forEach(edge => {
    let adjacentToLeft = adjacentPoints.get(edge.lSite) || []
    adjacentPoints.set(edge.lSite, adjacentToLeft.concat([edge.rSite]))

    let adjacentToRight = adjacentPoints.get(edge.rSite) || []
    adjacentPoints.set(edge.rSite, adjacentToRight.concat([edge.lSite]))
  })

  return adjacentPoints
}
