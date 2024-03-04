import {Player} from "./Player"
import {Tile} from "./TileSet"

const BOOMERANG_SIZE = 18
const BOOMERANG_THROW = 10

export default class Boomerang {
  id: string = ""
  player: string = ""
  width: number = 0 // width
  height: number = 0 // height
  x: number = 0 // x-coord
  y: number = 0 // y-coord
  vx: number = 0 // x velocity
  vy: number = 0 // y velocity
  color: string = ""
  gravity: number = 0
  thrown: number = 0

  constructor(id: string, player: Player, radians: number) {
    this.id = id
    this.player = player.id
    this.color = player.color
    this.x = player.x + player.width * .5
    this.y = player.y + player.height * .5
    this.vx = BOOMERANG_THROW * Math.cos(radians)
    this.vy = BOOMERANG_THROW * Math.sin(radians)
    this.width = BOOMERANG_SIZE
    this.height = BOOMERANG_SIZE
    this.gravity = .4545
    this.thrown = Date.now()
  }

  isBroke = (t: Tile): boolean => this.x < t.x + t.width
    && this.x + this.width > t.x
    && this.y < t.y + t.height
    && this.y + this.height > t.y

  isThrown = (p: Player): boolean => this.id === p.id && this.thrown + 250 > Date.now()

  isCaught = (p: Player): boolean => this.isThrown(p) && this.id === p.id && this.isColliding(p)

  isHit = (p: Player): boolean => this.player !== p.id && this.isColliding(p)

  isOut = () => (Date.now() - this.thrown) > 5000

  private isColliding = (p: Player): boolean => {
    return this.x < p.x + p.width && this.x + this.width > p.x && this.y < p.y + p.height && this.y + this.height > p.y
  }

  static toModel = (boomerang: Boomerang): BoomerangModel => ({
    id: boomerang.id,
    p: boomerang.player,
    c: boomerang.color,
    x: boomerang.x,
    y: boomerang.y,
    w: boomerang.width,
    h: boomerang.height,
    vx: boomerang.vx,
    vy: boomerang.vy,
  })
}

export interface BoomerangModel {
  id: string
  p: string
  c: string
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
}