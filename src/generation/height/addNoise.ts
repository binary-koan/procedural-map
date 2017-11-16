import RandomNumberGenerator from "../RandomNumberGenerator"
import MapTile from "../../types/MapTile"
import SimplexNoise from "simplex-noise"

export default function addNoise(
  rng: RandomNumberGenerator,
  tiles: MapTile[],
  options: { scale: number }
): MapTile[] {
  const noise = new SimplexNoise(rng.random)

  return tiles.map(tile => ({
    ...tile,
    height: noise.noise2D(tile.center.x / options.scale, tile.center.y / options.scale) * 50
  }))
}
