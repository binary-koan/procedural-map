import * as React from "react"
import "./App.css"
import randomPoints from "./generation/tiles/randomPoints"
import improvePoints, { ImproveResult } from "./generation/tiles/improvePoints"
import RandomNumberGenerator from "./generation/RandomNumberGenerator"
import Point from "./types/Point"
import MapTile from "./types/MapTile"
import initializeHeightmap from "./generation/height/initializeHeightmap"
import addNoise from "./generation/height/addNoise"

function pathDefinition(polygon: Point[]): string {
  return "M" + polygon.map(({ x, y }) => [x, y].join(" ")).join(" L") + " Z"
}

class App extends React.Component {
  state: {
    seed: string,
    display: string,
    initialPoints: Point[],
    improveResult: ImproveResult,
    baseHeightmap: MapTile[],
    heightWithNoise: MapTile[]
  }

  constructor(props: {}) {
    super(props)
    const seed = "totally random"

    this.state = {
      display: "",
      seed,
      ...this.doGeneration(seed)
    }
  }

  doGeneration(seed: string) {
    const rng = new RandomNumberGenerator(seed)
    const count = 1500

    const initialPoints = randomPoints(rng, {
      width: 1500,
      height: 1000,
      count: count
    })
    const improveResult = improvePoints(initialPoints)
    const baseHeightmap = initializeHeightmap(improveResult.mapPolygons)
    const heightWithNoise = addNoise(rng, baseHeightmap, {
      minScale: count / 10,
      maxScale: count / 2,
      landProportion: 0.4,
      iterations: 4
    })

    return { initialPoints, improveResult, baseHeightmap, heightWithNoise }
  }

  setSeed(seed: string) {
    this.setState({ seed: seed, ...this.doGeneration(seed) })
  }

  toggleInitialPoints() {
    this.setState({ display: "initialPoints" })
  }

  toggleVoroniStep(index: number) {
    this.setState({ display: `voroniStep${index}` })
  }

  displayToggle(title: string, onClick: () => void) {
    return <button type="button" onClick={onClick}>{title}</button>
  }

  voroniResult(index: number, points: Point[], polygons: Point[][]) {
    return (
      <g key={index} className={this.state.display === `voroniStep${index}` ? "group" : "group is-hidden"}>
        {points.map((point, i) => <circle key={i} cx={point.x} cy={point.y} r="2" fill="#00f" />)}
        {polygons.map((polygon, i) => <path key={i} d={pathDefinition(polygon)} stroke="#00f" fill="none" />)}
      </g>
    )
  }

  tileWithHeight(tile: MapTile, index: number) {
    let fill: string

    if (tile.height > 0) {
      let strength = Math.floor(tile.height * 200 + 16).toString(16)
      fill = "#" + strength + "ff" + strength
    } else {
      let strength = Math.floor(128 + tile.height * 100).toString(16)
      fill = "#" + strength + strength + "ff"
    }

    // if (tile.height > 0) {
    //   let greyValue = Math.floor(tile.height * 128 + 127).toString(16)
    //   fill = "#" + greyValue + greyValue + greyValue
    // } else {
    //   let blueValue = Math.floor(255 + tile.height * 128).toString(16)
    //   fill = "#8080" + blueValue
    // }

    return <path key={index} d={pathDefinition(tile.vertices)} fill={fill} />
  }

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <h3>Seed</h3>
          <input type="text" value={this.state.seed} onChange={e => this.setSeed(e.target.value)} />
          <h3>Display</h3>
          {this.displayToggle("Initial points", this.toggleInitialPoints.bind(this))}
          {this.state.improveResult.steps.map((_, i) =>
            <div key={i}>{this.displayToggle(`Voroni iteration ${i + 1}`, this.toggleVoroniStep.bind(this, i))}</div>
          )}
          {this.displayToggle("Map polygons", () => this.setState({ display: "mapPolygons" }))}
          {this.displayToggle("Base height", () => this.setState({ display: "baseHeightmap" }))}
          {this.displayToggle("Height with noise", () => this.setState({ display: "heightWithNoise" }))}
        </div>

        <svg className="App-view" viewBox="0 0 1500 1000">
          <g className={this.state.display === "initialPoints" ? "group" : "group is-hidden"}>
            {this.state.initialPoints.map((point, i) => <circle key={i} cx={point.x} cy={point.y} r="2" fill="#000" />)}
          </g>

          {this.state.improveResult.steps.map((step, i) => this.voroniResult(i, step.points, step.polygons))}

          <g className={this.state.display === "mapPolygons" ? "group" : "group is-hidden"}>
            {this.state.improveResult.mapPolygons.map((polygon, i) =>
              <path key={i} d={pathDefinition(polygon.vertices)} stroke="#0f0" fill="none" />)}
          </g>

          <g className={this.state.display === "baseHeightmap" ? "group" : "group is-hidden"}>
            {this.state.baseHeightmap.map((tile, i) => this.tileWithHeight(tile, i))}
          </g>

          <g className={this.state.display === "heightWithNoise" ? "group" : "group is-hidden"}>
            {this.state.heightWithNoise.map((tile, i) => this.tileWithHeight(tile, i))}
          </g>
        </svg>
      </div>
    )
  }
}

export default App
