import {Tile} from "./tile"
import {Boomerang} from "./boomerang"

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


  isColliding = (t: Tile): boolean => {
    return this.x < t.x + t.w && this.x + this.w > t.x && this.y < t.y + t.h && this.y + this.h > t.y
  }
  isWalkingOn = (t: Tile): boolean => {
    // +1 checks 1 row of pixels below player
    return this.x < t.x + t.w && this.x + this.w > t.x && this.y < t.y + t.h && this.y + this.h + 1 > t.y
  }
}

export interface Direction {
  u: boolean // up
  d: boolean // down
  l: boolean // left
  r: boolean // right
}