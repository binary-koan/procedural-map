import * as React from "react"
import Point from "./types/Point"
import { ImproveResult } from "./generation/tiles/improvePoints"
import { Map, MapTile } from "./types/MapTile"
import { WaterFlowResult } from "./generation/water/calculateWaterFlow"
import * as tinycolor from "tinycolor2"

const WIDTH = 1500
const HEIGHT = 1000

export enum DisplayLayer {
  InitialPoints,
  Voronoi,
  MapPolygons,
  PolygonNeighbours,
  BaseHeight,
  HeightWithNoise,
  WaterFlow
}

interface Props {
  display: DisplayLayer[],
  iteration?: number,
  initialPoints: Point[],
  improveResult: ImproveResult,
  baseMap: Map,
  heightWithNoise: Map,
  waterFlow: WaterFlowResult[]
}

export default class Canvas extends React.Component<Props> {
  canvas: HTMLCanvasElement | null

  constructor(props: Props) {
    super(props)
  }

  componentDidMount() {
    this.draw()
  }

  componentDidUpdate() {
    this.draw()
  }

  draw() {
    let context: CanvasRenderingContext2D | null

    if (this.canvas && (context = this.canvas.getContext("2d"))) {
      context!.clearRect(0, 0, WIDTH, HEIGHT)

      this.props.display.forEach(layer => {
        this[layer](context!)
      })
    }
  }

  [DisplayLayer.InitialPoints](context: CanvasRenderingContext2D) {
    context.fillStyle = "#000"

    this.props.initialPoints.forEach(point => {
      context.beginPath()
      context.ellipse(point.x, point.y, 2, 2, 0, 0, 2 * Math.PI)
      context.fill()
    })
  }

  [DisplayLayer.Voronoi](context: CanvasRenderingContext2D) {
    const step = this.props.improveResult.steps[this.props.iteration || 0]

    if (!step) {
      return
    }

    context.fillStyle = "#00f"

    step.points.forEach(point => {
      context.beginPath()
      context.ellipse(point.x, point.y, 2, 2, 0, 0, 2 * Math.PI)
      context.fill()
    })

    context.strokeStyle = "#44f"
    context.lineWidth = 1

    step.polygons.forEach(vertices => {
      this.addPolygon(vertices, context)
      context.stroke()
    })
  }

  [DisplayLayer.MapPolygons](context: CanvasRenderingContext2D) {
    context.strokeStyle = "#090"
    context.lineWidth = 1

    this.props.improveResult.mapPolygons.forEach(polygon => {
      this.addPolygon(polygon.vertices, context)
      context.stroke()
    })
  }

  [DisplayLayer.PolygonNeighbours](context: CanvasRenderingContext2D) {
    context.strokeStyle = "#a00"
    context.lineWidth = 1

    Object.keys(this.props.improveResult.neighbours).forEach(index => {
      this.props.improveResult.neighbours[parseInt(index, 10)].forEach(neighbourIndex => {
        this.addPolygon([
          this.props.improveResult.mapPolygons[index].center,
          this.props.improveResult.mapPolygons[neighbourIndex].center
        ], context)
        context.stroke()
      })
    })
  }

  [DisplayLayer.BaseHeight](context: CanvasRenderingContext2D) {
    this.drawTiles(this.props.baseMap.tiles, context)
  }

  [DisplayLayer.HeightWithNoise](context: CanvasRenderingContext2D) {
    this.drawTiles(this.props.heightWithNoise.tiles, context)
  }

  [DisplayLayer.WaterFlow](context: CanvasRenderingContext2D) {
    context.strokeStyle = "#" + tinycolor("#20428F").lighten(20).toHex()

    this.props.waterFlow.filter(flow => flow.flux > 1.5).forEach(flow => {
      context.lineWidth = flow.flux / 1.5
      this.addPolygon([flow.start, flow.end], context)
      context.stroke()
    })
  }

  addPolygon(vertices: Point[], context: CanvasRenderingContext2D) {
    context.beginPath()
    context.moveTo(vertices[0].x, vertices[0].y)
    vertices.slice(1).forEach(point => context.lineTo(point.x, point.y))
    context.closePath()
  }

  drawTiles(tiles: MapTile[], context: CanvasRenderingContext2D) {
    tiles.forEach(tile => {
      context.fillStyle = this.tileFill(tile)
      this.addPolygon(tile.vertices, context)
      context.fill()
    })
  }

  tileFill(tile: MapTile) {
    if (tile.centerPoint.z > 0) {
      let baseColor = tinycolor("#3FB038").lighten(20)

      if (tile.centerPoint.z >= 0.5) {
        return "#" + baseColor.lighten((tile.centerPoint.z - 0.5) * 80).toHex()
      } else {
        return "#" + baseColor.darken((0.5 - tile.centerPoint.z) * 50).toHex()
      }
    } else {
      return "#" + tinycolor("#20428F").lighten(10).toHex()
    }
  }

  render() {
    return <canvas ref={el => this.canvas = el} className="App-view" height={HEIGHT} width={WIDTH} />
  }
}
