export interface Player {
  id: string // ID
  address: string // address
  disconnected: number | undefined // is disconnected
  alive: boolean // is alive
  color: string // c
  name: string // name
  gravity: number // gravity
  sw: number // sw
  sj: number // sj
  w: number // width
  h: number // height
  x: number // x-coord
  y: number // y-coord
  vx: number // x velocity
  vy: number // y velocity
  arial: boolean
  direction: Direction // directions pressed
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