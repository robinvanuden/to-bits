import PowerUpModel from "./PowerUpModel"
import BoomerangModel from "./BoomerangModel"
import {FireballModel} from "./FireballModel"

export default interface PlayerModel {
  i: string
  uid: string
  n: string // color
  c: string // color
  ch: number // width
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
  fb: FireballModel[]
  a: number
}

interface Direction {
  u: boolean
  d: boolean
  l: boolean
  r: boolean
}