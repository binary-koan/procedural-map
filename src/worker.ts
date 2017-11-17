import { MessageToWorker, MessageFromWorker } from "./types/Message"
import RandomNumberGenerator from "./generation/RandomNumberGenerator"
import randomPoints from "./generation/tiles/randomPoints"
import improvePoints from "./generation/tiles/improvePoints"
import buildMap from "./generation/height/buildMap"
import addNoise from "./generation/height/addNoise"
import calculateWaterFlow from "./generation/water/calculateWaterFlow"

onmessage = message => {
  const { seed, complexity } = message.data as MessageToWorker

  const rng = new RandomNumberGenerator(seed)

  const initialPoints = randomPoints(rng, {
    width: 1500,
    height: 1000,
    count: complexity
  })
  postMessage({ type: "INITIAL_POINTS", result: initialPoints } as MessageFromWorker)

  const improveResult = improvePoints(initialPoints)
  postMessage({ type: "IMPROVED_RESULT", result: improveResult } as MessageFromWorker)

  const baseMap = buildMap(improveResult.mapPolygons, improveResult.neighbours)
  postMessage({ type: "BASE_MAP", result: baseMap.serialize() } as MessageFromWorker)

  const heightWithNoise = addNoise(rng, baseMap, {
    minScale: 150,
    maxScale: 750,
    landProportion: 0.4,
    iterations: 4
  })
  postMessage({ type: "HEIGHT_WITH_NOISE", result: heightWithNoise.serialize() } as MessageFromWorker)

  const waterFlow = calculateWaterFlow(heightWithNoise)
  postMessage({ type: "WATER_FLOW", result: waterFlow } as MessageFromWorker)
}
