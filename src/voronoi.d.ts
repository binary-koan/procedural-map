declare module "voronoi" {
  export interface Site {
    x: number,
    y: number
  }

  export interface BoundingBox {
    xl: number,
    xr: number,
    yt: number,
    yb: number
  }

  export interface Vertex {
    x: number,
    y: number
  }

  export interface Edge {
    lSite: Site,
    rSite: Site,
    va: Vertex,
    vb: Vertex
  }

  export interface Halfedge {
    site: Site,
    edge: Edge,
    getStartpoint(): Vertex,
    getEndpoint(): Vertex
  }

  export interface Cell {
    site: Site,
    halfedges: Halfedge[]
  }

  export interface Diagram {
    vertices: Vertex[],
    edges: Edge[],
    cells: Cell[],
    execTime: number
  }

  class Voronoi {
    compute(sites: Site[], bbox: BoundingBox): Diagram
  }

  export default Voronoi
}
