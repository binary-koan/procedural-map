import { Map, MapTile } from "../../types/MapTile"
import Point from "../../types/Point"

export interface WaterFlowResult {
  start: Point,
  end: Point,
  flux: number
}

export default function calculateWaterFlow(
  map: Map,
): WaterFlowResult[] {
  const tilesWithNeighbours = map.tiles.map((tile, i) => ({
    tile,
    neighbours: map.neighbours[i].map(neighbourIndex => map.tiles[neighbourIndex])
  }))
  const tilesByHeight = tilesWithNeighbours.sort((a, b) => b.tile.centerPoint.z - a.tile.centerPoint.z)

  const waterFlow = [] as WaterFlowResult[]

  tilesByHeight.forEach(({ tile, neighbours }, index) => {
    if (tile.centerPoint.z > 0) {
      addWaterFlowResult(tile, neighbours, waterFlow)
    }
  })

  return Object.values(waterFlow).filter(Boolean) as WaterFlowResult[]
}

function addWaterFlowResult(tile: MapTile, neighbours: MapTile[], flow: WaterFlowResult[]) {
  const lowestNeighbour = neighbours.sort((a, b) => a.centerPoint.z - b.centerPoint.z)[0]

  if (lowestNeighbour) {
    const fluxIn = flow.
      filter(result => result.end.x === tile.centerPoint.x && result.end.y === tile.centerPoint.y).
      reduce((total, current) => total + current.flux, 0)

    const tileFlux = (tile.highestPoint.z - tile.lowestPoint.z) * 10

    flow.push({ start: tile.centerPoint, end: lowestNeighbour.centerPoint, flux: fluxIn + tileFlux })
  }

  // edges.forEach(edge => {
  //   const [uphill, downhill] = edge.sort(vertex => vertex.z)
  //   const id = `${uphill.x},${uphill.y}`

  //   if (uphill.z <= 0 && downhill.z <= 0) {
  //     flow[id] = undefined
  //   } else {
  //     flow[id] = flow[id] || flowResult(uphill, downhill, flow)
  //   }
  // })
}

// function flowResult(start: Point3D, end: Point3D, flow: WaterFlowResult[]) {
//   let flux = 1

//   Object.values(flow).forEach(value => {
//     if (value && value.end.x === start.x && value.end.y === start.y) {
//       flux += value.flux
//     }
//   })

//   return { start, end, flux }
// }
