import RandomNumberGenerator from "../RandomNumberGenerator"
import { Map, MapTile } from "../../types/MapTile"
import SimplexNoise from "simplex-noise"

export default function addNoise(
  rng: RandomNumberGenerator,
  map: Map,
  options: { minScale: number, maxScale: number, landProportion: number, iterations: number }
): Map {
  const noise = new SimplexNoise(rng.random)

  let tiles = map.tiles
  let scale = options.minScale

  for (var i = 0; i < options.iterations; i++) {
    tiles = applyNoise(tiles, noise, scale)
    scale += (options.maxScale - options.minScale) / (options.iterations - 1)
  }

  return new Map(fixHeights(tiles, options.landProportion), map.neighbours)
}

function applyNoise(tiles: MapTile[], noise: SimplexNoise, scale: number) {
  return tiles.map(tile => tile.applyNoise((x, y) => noise.noise2D(x / scale, y / scale)))
}

function fixHeights(tiles: MapTile[], landProportion: number) {
  const sortedByHeight = tiles.slice(0).sort((a, b) => a.centerPoint.z - b.centerPoint.z)
  const splitPoint = sortedByHeight[Math.floor(tiles.length * (1 - landProportion))].centerPoint.z
  const maxHeight = sortedByHeight[sortedByHeight.length - 1].highestPoint.z

  return tiles.map(tile => {
    if (tile.centerPoint.z <= splitPoint) {
      return tile.flatten(0)
    } else {
      return tile.normalize(splitPoint, maxHeight)
    }
  })
}
