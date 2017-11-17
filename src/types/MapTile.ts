import Point from "./Point"

export type MapPolygon = {
  vertices: [Point, Point, Point],
  center: Point
}

export interface Point3D extends Point {
  z: number
}

export class Map {
  tiles: MapTile[]
  neighbours: { [index: number]: number[] }

  constructor(tiles: MapTile[], neighbours: { [index: number]: number[] }) {
    this.tiles = tiles
    this.neighbours = neighbours
  }
}

export class MapTile {
  vertices: [Point3D, Point3D, Point3D]

  static fromPolygon(polygon: MapPolygon) {
    return new MapTile(
      polygon.vertices.map(vertex => ({ ...vertex, z: 0 })) as [Point3D, Point3D, Point3D]
    )
  }

  constructor(vertices: [Point3D, Point3D, Point3D]) {
    this.vertices = vertices
  }

  get centerPoint(): Point3D {
    return {
      x: average(this.vertices.map(v => v.x)),
      y: average(this.vertices.map(v => v.y)),
      z: average(this.vertices.map(v => v.z))
    }
  }

  get lowestPoint() {
    return this.vertices.sort((a, b) => a.z - b.z)[0]
  }

  get highestPoint() {
    return this.vertices.sort((a, b) => b.z - a.z)[0]
  }

  get edges(): [Point3D, Point3D][] {
    return [
      [this.vertices[0], this.vertices[1]],
      [this.vertices[1], this.vertices[2]],
      [this.vertices[2], this.vertices[0]]
    ]
  }

  applyNoise(noise: (x: number, y: number) => number) {
    return new MapTile(
      this.vertices.map(vertex =>
        ({ ...vertex, z: vertex.z + noise(vertex.x, vertex.y) })
      ) as [Point3D, Point3D, Point3D]
    )
  }

  flatten(height: number) {
    return new MapTile(
      this.vertices.map(vertex => ({ ...vertex, z: height })) as [Point3D, Point3D, Point3D]
    )
  }

  normalize(minHeight: number, maxHeight: number) {
    return new MapTile(
      this.vertices.map(vertex => this.normalizeZ(vertex, minHeight, maxHeight)) as [Point3D, Point3D, Point3D]
    )
  }

  private normalizeZ(vertex: Point3D, minHeight: number, maxHeight: number) {
    let z = (vertex.z - minHeight) / (maxHeight - minHeight)
    if (z < minHeight) { z = minHeight }
    if (z > maxHeight) { z = maxHeight }

    return { ...vertex, z }
  }
}

function average(values: number[]) {
  return values.reduce((total, value) => total + value) / values.length
}
