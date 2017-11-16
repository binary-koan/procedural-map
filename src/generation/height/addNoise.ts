import RandomNumberGenerator from "../RandomNumberGenerator"
import MapTile from "../../types/MapTile"
import SimplexNoise from "simplex-noise"

export default function addNoise(
  rng: RandomNumberGenerator,
  tiles: MapTile[],
  options: { minScale: number, maxScale: number, landProportion: number, iterations: number }
): MapTile[] {
  const noise = new SimplexNoise(rng.random)

  let scale = options.minScale
  for (var i = 0; i < options.iterations; i++) {
    tiles = applyNoise(tiles, noise, scale)
    scale += (options.maxScale - options.minScale) / (options.iterations - 1)
  }

  return fixHeights(tiles, options.landProportion)
}

function applyNoise(tiles: MapTile[], noise: SimplexNoise, scale: number) {
  return tiles.map(tile => tile.applyNoise((x, y) => noise.noise2D(x / scale, y / scale)))
}

function fixHeights(tiles: MapTile[], landProportion: number) {
  const sortedByHeight = tiles.sort((a, b) => a.centerPoint.z - b.centerPoint.z)
  const splitPoint = Math.floor(tiles.length * (1 - landProportion))

  const waterTiles = sortedByHeight.slice(0, splitPoint).map(tile => tile.flatten(0))
  const landTiles = normalize(sortedByHeight.slice(splitPoint))

  return waterTiles.concat(landTiles)
}

function normalize(tiles: MapTile[]) {
  const minHeight = tiles[0].lowestPoint.z
  const maxHeight = tiles[tiles.length - 1].highestPoint.z

  return tiles.map(tile => tile.normalize(minHeight, maxHeight))
}
