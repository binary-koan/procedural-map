import * as React from "react"
import "./App.css"
import randomPoints from "./generation/randomPoints"
import improvePoints, { ImproveResult } from "./generation/improvePoints"
import RandomNumberGenerator from "./generation/RandomNumberGenerator"
import Point from "./types/Point"

function pathDefinition(polygon: Point[]): string {
  return "M" + polygon.map(({ x, y }) => [x, y].join(" ")).join(" L") + " Z"
}

class App extends React.Component {
  state: {
    seed: string,
    display: string,
    initialPoints: Point[],
    improveResult: ImproveResult
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
    const initialPoints = randomPoints(new RandomNumberGenerator(seed), {
      width: 1000,
      height: 1000,
      count: 1000
    })
    const improveResult = improvePoints(initialPoints)

    return { initialPoints, improveResult }
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

  displayToggle(title: string, onClick: () => undefined) {
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
        </div>

        <svg className="App-view" viewBox="0 0 1000 1000">
          <g className={this.state.display === "initialPoints" ? "group" : "group is-hidden"}>
            {this.state.initialPoints.map((point, i) => <circle key={i} cx={point.x} cy={point.y} r="2" fill="#000" />)}
          </g>
          {this.state.improveResult.steps.map((step, i) => this.voroniResult(i, step.points, step.polygons))}
        </svg>
      </div>
    )
  }
}

export default App
