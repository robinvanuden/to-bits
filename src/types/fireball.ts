import Tile from "./Tile"
import {Player} from "./Player"

const FIREBALL_SIZE = 18
const FIREBALL_THROW = 14

export default class Fireball {
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
    this.vx = FIREBALL_THROW * Math.cos(radians)
    this.vy = FIREBALL_THROW * Math.sin(radians)
    this.width = FIREBALL_SIZE
    this.height = FIREBALL_SIZE
    this.gravity = .4545
    this.thrown = Date.now()
  }

  isBroke = (t: Tile): boolean => this.x < t.x + t.w
    && this.x + this.width > t.x
    && this.y < t.y + t.h
    && this.y + this.height > t.y

  isHit = (p: Player): boolean => this.player !== p.id && this.isColliding(p)

  isOut = () => (Date.now() - this.thrown) > 5000

  private isColliding = (p: Player): boolean => {
    return this.x < p.x + p.width && this.x + this.width > p.x && this.y < p.y + p.height && this.y + this.height > p.y
  }

  static toModel = (fireball: Fireball): FireballModel => ({
    id: fireball.id,
    p: fireball.player,
    c: fireball.color,
    x: fireball.x,
    y: fireball.y,
    w: fireball.width,
    h: fireball.height,
    vx: fireball.vx,
    vy: fireball.vy,
  })
}

export interface FireballModel {
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