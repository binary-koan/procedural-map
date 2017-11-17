import * as React from "react"
import "./App.css"
import { ImproveResult } from "./generation/tiles/improvePoints"
import Point from "./types/Point"
import { Map } from "./types/MapTile"
import { WaterFlowResult } from "./generation/water/calculateWaterFlow"
import Canvas, { DisplayLayer } from "./Canvas"
import { MessageFromWorker, MessageToWorker } from "./types/Message"

class App extends React.Component {
  state: {
    complexity: number,
    seed: string,
    display: DisplayLayer[],
    iteration?: number,
    initialPoints?: Point[],
    improveResult?: ImproveResult,
    baseMap?: Map,
    noiseSteps?: Map[],
    heightWithNoise?: Map,
    waterFlow?: WaterFlowResult[]
  }

  worker: Worker

  constructor(props: {}) {
    super(props)
    const complexity = 1500
    const seed = "totally random"

    this.state = {
      display: [],
      complexity,
      seed
    }
  }

  componentDidMount() {
    this.worker = new Worker("/static/js/worker.js")

    this.worker.onmessage = message => {
      const data = message.data as MessageFromWorker

      if (data.type === "INITIAL_POINTS") {
        this.setState({ initialPoints: data.result })
      } else if (data.type === "IMPROVED_RESULT") {
        this.setState({ improveResult: data.result })
      } else if (data.type === "BASE_MAP") {
        this.setState({ baseMap: Map.deserialize(data.result) })
      } else if (data.type === "NOISE_STEPS") {
        this.setState({ noiseSteps: data.result.map(Map.deserialize) })
      } else if (data.type === "HEIGHT_WITH_NOISE") {
        this.setState({ heightWithNoise: Map.deserialize(data.result) })
      } else if (data.type === "WATER_FLOW") {
        this.setState({ waterFlow: data.result })
      }
    }

    this.doGeneration()
  }

  doGeneration() {
    this.setState({
      initialPoints: undefined,
      improveResult: undefined,
      baseMap: undefined,
      noiseSteps: undefined,
      heightWithNoise: undefined,
      waterFlow: undefined,
      display: []
    })
    this.worker.postMessage({ complexity: this.state.complexity, seed: this.state.seed } as MessageToWorker)
  }

  setComplexity(value: string) {
    let complexity = parseInt(value, 10)
    this.setState({ complexity }, () => this.doGeneration())
  }

  setSeed(seed: string) {
    this.setState({ seed }, () => this.doGeneration())
  }

  displayToggle(title: string, enabled: boolean, layers: DisplayLayer[] = [], iteration?: number) {
    const onClick = () => this.setState({ display: layers, iteration: iteration })

    return <button type="button" onClick={onClick} disabled={!enabled}>{title}</button>
  }

  voronoiToggles() {
    if (this.state.improveResult) {
      return this.state.improveResult.steps.map((_, i) =>
        <div key={i}>{this.displayToggle(`Voronoi iteration ${i + 1}`, true, [DisplayLayer.Voronoi], i)}</div>
      )
    } else {
      return this.displayToggle("Voroni iterations", false)
    }
  }

  noiseStepToggles() {
    if (this.state.noiseSteps) {
      return this.state.noiseSteps.map((_, i) =>
        <div key={i}>{this.displayToggle(`Noise iteration ${i + 1}`, true, [DisplayLayer.NoiseStep], i)}</div>
      )
    } else {
      return this.displayToggle("Noise iterations", false)
    }
  }

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
            {this.displayToggle("Initial points", Boolean(this.state.initialPoints), [DisplayLayer.InitialPoints])}
            {this.voronoiToggles()}
            {this.displayToggle("Map polygons", Boolean(this.state.improveResult), [DisplayLayer.MapPolygons])}
            {this.displayToggle("Polygon neighbours", Boolean(this.state.improveResult), [
              DisplayLayer.MapPolygons, DisplayLayer.PolygonNeighbours
            ])}
            {this.displayToggle("Base height", Boolean(this.state.baseMap), [DisplayLayer.BaseHeight])}
            {this.noiseStepToggles()}
            {this.displayToggle("Height with noise", Boolean(this.state.heightWithNoise), [
              DisplayLayer.HeightWithNoise
            ])}
            {this.displayToggle("Water flow", Boolean(this.state.waterFlow), [
              DisplayLayer.HeightWithNoise, DisplayLayer.WaterFlow
            ])}
          </div>
        </div>

        <Canvas
          display={this.state.display}
          iteration={this.state.iteration}
          initialPoints={this.state.initialPoints}
          improveResult={this.state.improveResult}
          baseMap={this.state.baseMap}
          noiseSteps={this.state.noiseSteps}
          heightWithNoise={this.state.heightWithNoise}
          waterFlow={this.state.waterFlow}
        />
      </div>
    )
  }
}

export default App
