import PowerUpModel from "./PowerUpModel"
import {DamageModel} from "./DamageModel"

export default interface PlayerModel {
  i: string // client-id
  uid: string // id
  n: string // name
  c: string // color
  hp: number // health
  hpm: number // health max
  w: number // width
  h: number // height
  x: number // x-coord
  y: number // y-coord
  vx: number // x-coord
  vy: number // y-coord
  dmg?: DamageModel // time damaged
  tod: number // time of death
  tdc: number // timeDisconnected
  l: Direction // looking
  m: Direction // moving
  pu: PowerUpModel[]
  ps: number
}

interface Direction {
  u: boolean // up
  d: boolean // down
  l: boolean // left
  r: boolean // right
}