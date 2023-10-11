import {Tile} from "./tile"

export class Boomerang {
  id: string
  player: string
  w: number // width
  h: number // height
  x: number // x-coord
  y: number // y-coord
  vx: number // x velocity
  vy: number // y velocity
  gravity: number
  thrown: number

  isBroke = (t: Tile): boolean => {
    if (this.thrown + 2000 < Date.now()) {
      return true
    }
    return this.x < t.x + t.w && this.x + this.w > t.x && this.y < t.y + t.h && this.y + this.h > t.y
  }
}