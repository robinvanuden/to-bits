import PowerUpModel from "./PowerUpModel"

export default interface PlayerModel {
  i: string // id
  uid: string // client-id
  n: string // name
  c: string // color
  hp: number // health
  w: number // width
  h: number // height
  x: number // x-coord
  y: number // y-coord
  vx: number // x-coord
  vy: number // y-coord
  d: number | undefined // died
  dc: number | undefined // disconnected
  l: Direction // looking
  m: Direction // moving
  pu: PowerUpModel[]
}

interface Direction {
  u: boolean // up
  d: boolean // down
  l: boolean // left
  r: boolean // right
}