declare module "simplex-noise" {
  class SimplexNoise {
    constructor(random?: () => number)

    noise2D(x: number, y: number): number
    noise3D(x: number, y: number, z: number): number
    noise4D(x: number, y: number, z: number, w: number): number
  }

  export default SimplexNoise
}
