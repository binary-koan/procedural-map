import * as React from "react"
import "./App.css"
import randomPoints from "./generation/tiles/randomPoints"
import improvePoints, { ImproveResult } from "./generation/tiles/improvePoints"
import RandomNumberGenerator from "./generation/RandomNumberGenerator"
import Point from "./types/Point"
import { Map } from "./types/MapTile"
import buildMap from "./generation/height/buildMap"
import addNoise from "./generation/height/addNoise"
import calculateWaterFlow, { WaterFlowResult } from "./generation/water/calculateWaterFlow"
import Canvas, { DisplayLayer } from "./Canvas"

// function pathDefinition(polygon: Point[]): string {
//   return "M" + polygon.map(({ x, y }) => [x, y].join(" ")).join(" L") + " Z"
// }

class App extends React.Component {
  state: {
    complexity: number,
    seed: string,
    display: DisplayLayer[],
    iteration?: number,
    initialPoints: Point[],
    improveResult: ImproveResult,
    baseMap: Map,
    heightWithNoise: Map,
    waterFlow: WaterFlowResult[]
  }

  constructor(props: {}) {
    super(props)
    const complexity = 1500
    const seed = "totally random"

    this.state = {
      display: [],
      complexity,
      seed,
      ...this.doGeneration(complexity, seed)
    }
  }

  doGeneration(complexity: number, seed: string) {
    const rng = new RandomNumberGenerator(seed)

    const initialPoints = randomPoints(rng, {
      width: 1500,
      height: 1000,
      count: complexity
    })
    const improveResult = improvePoints(initialPoints)
    const baseMap = buildMap(improveResult.mapPolygons, improveResult.neighbours)
    const heightWithNoise = addNoise(rng, baseMap, {
      minScale: 150,
      maxScale: 750,
      landProportion: 0.4,
      iterations: 4
    })

    const waterFlow = calculateWaterFlow(heightWithNoise)

    return { initialPoints, improveResult, baseMap, heightWithNoise, waterFlow }
  }

  setComplexity(value: string) {
    let complexity = parseInt(value, 10)
    this.setState({ complexity, ...this.doGeneration(complexity, this.state.seed) })
  }

  setSeed(seed: string) {
    this.setState({ seed: seed, ...this.doGeneration(this.state.complexity, seed) })
  }

  // toggleInitialPoints() {
  //   this.setState({ display: "initialPoints" })
  // }

  // toggleVoroniStep(index: number) {
  //   this.setState({ display: `voroniStep${index}` })
  // }

  // shownWithDisplay(...displays: string[]) {
  //   return displays.includes(this.state.display) ? "group" : "group is-hidden"
  // }

  displayToggle(title: string, layers: DisplayLayer[], iteration?: number) {
    const onClick = () => this.setState({ display: layers, iteration: iteration })

    return <button type="button" onClick={onClick}>{title}</button>
  }

  // voroniResult(index: number, points: Point[], polygons: Point[][]) {
  //   return (
  //     <g key={index} className={this.shownWithDisplay(`voroniStep${index}`)}>
  //       {points.map((point, i) => <circle key={i} cx={point.x} cy={point.y} r="2" fill="#00f" />)}
  //       {polygons.map((polygon, i) => <path key={i} d={pathDefinition(polygon)} stroke="#00f" fill="none" />)}
  //     </g>
  //   )
  // }

  // tileWithHeight(tile: MapTile, index: number) {
  //   let fill: string

  //   if (tile.centerPoint.z > 0) {
  //     let strength = Math.floor(tile.centerPoint.z * 200 + 16).toString(16)
  //     fill = "#" + strength + "ff" + strength
  //   } else {
  //     let strength = Math.floor(128 + tile.centerPoint.z * 100).toString(16)
  //     fill = "#" + strength + strength + "ff"
  //   }

  //   return <path key={index} d={pathDefinition(tile.vertices)} fill={fill} />
  // }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h3>Complexity</h3>
          <input type="number" value={this.state.complexity} onChange={e => this.setComplexity(e.target.value)} />
          <h3>Seed</h3>
          <input type="text" value={this.state.seed} onChange={e => this.setSeed(e.target.value)} />
          <h3>Display</h3>
          <div className="App-header-buttons">
            {this.displayToggle("Initial points", [DisplayLayer.InitialPoints])}
            {this.state.improveResult.steps.map((_, i) =>
              <div key={i}>{this.displayToggle(`Voroni iteration ${i + 1}`, [DisplayLayer.Voronoi], i)}</div>
            )}
            {this.displayToggle("Map polygons", [DisplayLayer.MapPolygons])}
            {this.displayToggle("Polygon neighbours", [DisplayLayer.MapPolygons, DisplayLayer.PolygonNeighbours])}
            {this.displayToggle("Base height", [DisplayLayer.BaseHeight])}
            {this.displayToggle("Height with noise", [DisplayLayer.HeightWithNoise])}
            {this.displayToggle("Water flow", [DisplayLayer.HeightWithNoise, DisplayLayer.WaterFlow])}
          </div>
        </div>

        {/* <svg className="App-view hide" viewBox="0 0 1500 1000">
          <g className={this.shownWithDisplay("initialPoints")}>
            {this.state.initialPoints.map((point, i) => <circle key={i} cx={point.x} cy={point.y} r="2" fill="#000" />)}
          </g>

          {this.state.improveResult.steps.map((step, i) => this.voroniResult(i, step.points, step.polygons))}

          <g className={this.shownWithDisplay("mapPolygons", "polygonNeighbours")}>
            {this.state.improveResult.mapPolygons.map((polygon, i) =>
              <path key={i} d={pathDefinition(polygon.vertices)} stroke="#0f0" fill="none" />)}
          </g>

          <g className={this.shownWithDisplay("polygonNeighbours")}>
            {Object.keys(this.state.improveResult.neighbours).map(index =>
              this.state.improveResult.neighbours[parseInt(index, 10)].map(neighbourIndex =>
                <path
                  key={[index, neighbourIndex].join(",")}
                  d={pathDefinition([
                    this.state.improveResult.mapPolygons[index].center,
                    this.state.improveResult.mapPolygons[neighbourIndex].center
                  ])}
                  stroke="#800"
                  fill="none"
                />
              )
            )}
          </g>

          <g className={this.shownWithDisplay("baseHeightmap")}>
            {this.state.baseMap.tiles.map((tile, i) => this.tileWithHeight(tile, i))}
          </g>

          <g className={this.shownWithDisplay("heightWithNoise", "waterFlow")}>
            {this.state.heightWithNoise.tiles.map((tile, i) => this.tileWithHeight(tile, i))}
          </g>

          <g className={this.shownWithDisplay("waterFlow")}>
            {this.state.waterFlow.filter(flow => flow.flux > 1.5).map((flow, i) =>
              <path
                key={i}
                d={pathDefinition([{ x: flow.start.x, y: flow.start.y }, { x: flow.end.x, y: flow.end.y }])}
                stroke="#00f"
                strokeWidth={flow.flux}
              />
            )}
          </g>
        </svg> */}

        <Canvas
          display={this.state.display}
          iteration={this.state.iteration}
          initialPoints={this.state.initialPoints}
          improveResult={this.state.improveResult}
          baseMap={this.state.baseMap}
          heightWithNoise={this.state.heightWithNoise}
          waterFlow={this.state.waterFlow}
        />
      </div>
    )
  }
}

export default App
