import PowerUpModel from "./PowerUpModel"
import BoomerangModel from "./BoomerangModel"

export default interface PlayerModel {
  i: string
  n: string // color
  c: string // color
  w: number // width
  h: number // height
  x: number // x-coord
  y: number // y-coord
  vx: number // x velocity
  vy: number // y velocity
  d: number | undefined // died
  dc: number | undefined // disconnected
  l: Direction
  m: Direction
  pu: PowerUpModel[]
  br: BoomerangModel[]
  a: number
}

interface Direction {
  u: boolean
  d: boolean
  l: boolean
  r: boolean
}