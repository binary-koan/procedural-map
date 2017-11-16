import RandomNumberGenerator from "../RandomNumberGenerator"
import Point from "../../types/Point"

export default function randomPoints(
  rng: RandomNumberGenerator,
  options: { width: number, height: number, count: number }
): Point[] {
  let result = []

  for (let i = 0; i < options.count; i++) {
    result.push({ x: rng.decimal(options.width), y: rng.decimal(options.height) })
  }

  return result
}
