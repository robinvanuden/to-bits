import {PowerUpModel} from "./PowerUpModel"

export interface Direction {
  u: boolean // up
  d: boolean // down
  l: boolean // left
  r: boolean // right
}

export default interface PlayerModel {
  i: string,
  uid: string
  n: string // name
  c: string // color
  w: number // width
  hp: number // healthPoints
  h: number // height
  x: number // x-coord
  y: number // y-coord
  vx: number // x-coord
  vy: number // y-coord
  tdm: number // time damaged
  tod: number // time of death
  tdc: number // timeDisconnected
  l: Direction
  m: Direction
  pu: PowerUpModel[]
}