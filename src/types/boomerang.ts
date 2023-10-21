import Tile from "./tile"
import {Player} from "./player"

const BOOMERANG_SIZE = 18
const BOOMERANG_THROW = 14

export class Boomerang {
  id: string = ""
  player: string = ""
  w: number = 0 // width
  h: number = 0 // height
  x: number = 0 // x-coord
  y: number = 0 // y-coord
  vx: number = 0 // x velocity
  vy: number = 0 // y velocity
  color: string = ""
  gravity: number = 0
  thrown: number = 0

  constructor(id: string, player: Player, x: number, y: number, radians: number) {
    this.id = id
    this.player = player.id
    this.color = player.color
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
    return this.x < t.x + t.w && this.x + this.w > t.x && this.y < t.y + t.h && this.y + this.h > t.y
  }

  isThrown = (p: Player): boolean => this.id === p.id && this.thrown + 250 > Date.now()

  isCaught = (p: Player): boolean => this.isThrown(p) && this.id === p.id && this.isColliding(p)

  isHit = (p: Player): boolean => this.player !== p.id && this.isColliding(p)

  private isColliding = (p: Player): boolean => {
    return this.x < p.x + p.w && this.x + this.w > p.x && this.y < p.y + p.h && this.y + this.h > p.y
  }
}