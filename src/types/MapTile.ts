import Point from "./Point"

export type MapPolygon = {
  vertices: [Point, Point, Point],
  center: Point
}

export interface Point3D extends Point {
  z: number
}

export default class MapTile {
  vertices: [Point3D, Point3D, Point3D]
  center: Point3D

  static fromPolygon(polygon: MapPolygon) {
    return new MapTile(
      polygon.vertices.map(vertex => ({ ...vertex, z: 0 })) as [Point3D, Point3D, Point3D],
      { ...polygon.center, z: 0 }
    )
  }

  constructor(vertices: [Point3D, Point3D, Point3D], center: Point3D) {
    this.vertices = vertices
    this.center = center
  }

  applyNoise(noise: (x: number, y: number) => number) {
    return new MapTile(
      this.vertices.map(vertex =>
        ({ ...vertex, z: vertex.z + noise(vertex.x, vertex.y) })
      ) as [Point3D, Point3D, Point3D],
      { ...this.center, z: this.center.z + noise(this.center.x, this.center.y) }
    )
  }

  flatten(height: number) {
    return new MapTile(
      this.vertices.map(vertex => ({ ...vertex, z: height })) as [Point3D, Point3D, Point3D],
      { ...this.center, z: height }
    )
  }

  normalize(minHeight: number, maxHeight: number) {
    return new MapTile(
      this.vertices.map(vertex => this.normalizeZ(vertex, minHeight, maxHeight)) as [Point3D, Point3D, Point3D],
      this.normalizeZ(this.center, minHeight, maxHeight)
    )
  }

  private normalizeZ(vertex: Point3D, minHeight: number, maxHeight: number) {
    let z = (vertex.z - minHeight) / (maxHeight - minHeight)
    if (z < minHeight) { z = minHeight }
    if (z > maxHeight) { z = maxHeight }

    return { ...vertex, z }
  }
}
