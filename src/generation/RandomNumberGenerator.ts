import * as seedrandom from "seedrandom"

export default class RandomNumberGenerator {
  random: seedrandom.prng

  constructor(seed: string) {
    this.random = seedrandom(seed)
  }

  decimal(lower: number, upper?: number): number {
    if (!upper) {
      upper = lower;
      lower = 0;
    }
    return lower + this.random() * (upper - lower)
  }
}
