export class Player {
  id: string // ID
  disconnected: number | undefined // is disconnected
  died: number | undefined
  color: string // color
  name: string // name
  gravity: number // gravity
  sw: number // speed walking
  sj: number // speed jumping
  w: number // width
  h: number // height
  x: number // x-coord
  y: number // y-coord
  vx: number // x velocity
  vy: number // y velocity
  arial: boolean
  move: Direction // directions pressed
  boomerangs: Boomerang[]
}

export interface Direction {
  u: boolean // up
  d: boolean // down
  l: boolean // left
  r: boolean // right
}

export interface Boomerang {
  id: string
  player: string
  w: number // width
  h: number // height
  x: number // x-coord
  y: number // y-coord
  vx: number // x velocity
  vy: number // y velocity
  gravity: number,
  thrown: number
}