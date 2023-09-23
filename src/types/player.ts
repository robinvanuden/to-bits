export interface Player {
  id: string // ID
  address: string // address
  connected: boolean // is connected
  color: string // color
  name: string // name
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