export interface Player {
  id: string // ID
  address: string // address
  connected: boolean // is connected
  alive: boolean // is alive
  color: string // color
  name: string // name
  gravity: number
  speed_walk: number
  speed_jump: number
  w: number // width
  h: number // height
  x: number // x-coord
  y: number // y-coord
  vx: number // x velocity
  vy: number // y velocity
  canJump: boolean // can jump
  direction: Direction, // directions pressed
}

export interface Direction {
  u: boolean // up
  d: boolean // down
  l: boolean // left
  r: boolean // right
}