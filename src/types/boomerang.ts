import {Tile} from "./tile"

const BOOMERANG_SIZE = 14
const BOOMERANG_THROW = 20

export class Boomerang {
  id: string = ""
  player: string = ""
  w: number = 0 // width
  h: number = 0 // height
  x: number = 0 // x-coord
  y: number = 0 // y-coord
  vx: number = 0 // x velocity
  vy: number = 0 // y velocity
  gravity: number = 0
  thrown: number = 0

  constructor(id: string, player: string, x: number, y: number, radians: number) {
    this.id = id
    this.player = player
    this.x = x
    this.y = y
    this.vx = BOOMERANG_THROW * Math.cos(radians)
    this.vy = BOOMERANG_THROW * Math.sin(radians)
    this.w = BOOMERANG_SIZE
    this.h = BOOMERANG_SIZE
    this.gravity = .4545
    this.thrown = Date.now()
  }

  isBroke = (t: Tile): boolean => {
    if (this.thrown + 2000 < Date.now()) {
      return true
    }
    return this.x < t.x + t.w && this.x + this.w > t.x && this.y < t.y + t.h && this.y + this.h > t.y
  }
}