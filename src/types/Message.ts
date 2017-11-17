import Point from "./Point"
import { ImproveResult } from "../generation/tiles/improvePoints"
import { MapData } from "./MapTile"
import { WaterFlowResult } from "../generation/water/calculateWaterFlow"

export type MessageToWorker = { seed: string, complexity: number }

export type MessageFromWorker =
  { type: "INITIAL_POINTS", result: Point[] } |
  { type: "IMPROVED_RESULT", result: ImproveResult } |
  { type: "BASE_MAP", result: MapData } |
  { type: "HEIGHT_WITH_NOISE", result: MapData } |
  { type: "WATER_FLOW", result: WaterFlowResult[] }
