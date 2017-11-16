import * as React from "react"
import "./App.css"
import randomPoints from "./generation/randomPoints"
import improvePoints from "./generation/improvePoints"
import RandomNumberGenerator from "./generation/RandomNumberGenerator"
import Point from "./types/Point"

const initialPoints = randomPoints(new RandomNumberGenerator("bla"), {
  width: 1000,
  height: 1000,
  count: 1000
})
const improveResult = improvePoints(initialPoints)

function pathDefinition(polygon: Point[]): string {
  return "M" + polygon.map(({ x, y }) => [x, y].join(" ")).join(" L") + " Z"
}

class App extends React.Component {
  state = {
    display: ""
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
          <h3>Display</h3>
          {this.displayToggle("Initial points", this.toggleInitialPoints.bind(this))}
          {improveResult.steps.map((_, i) =>
            <div key={i}>{this.displayToggle(`Voroni iteration ${i + 1}`, this.toggleVoroniStep.bind(this, i))}</div>
          )}
        </div>

        <svg className="App-view" viewBox="0 0 1000 1000">
          <g className={this.state.display === "initialPoints" ? "group" : "group is-hidden"}>
            {initialPoints.map((point, i) => <circle key={i} cx={point.x} cy={point.y} r="2" fill="#000" />)}
          </g>
          {improveResult.steps.map((step, i) => this.voroniResult(i, step.points, step.polygons))}
        </svg>
      </div>
    )
  }
}

export default App
