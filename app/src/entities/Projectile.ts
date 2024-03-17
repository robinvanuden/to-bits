import Player from "./Player"
import MapTile from "./MapTile"
import PowerUp, {PowerType} from "./PowerUp"
import {v4} from "uuid"
import {
  BOMB_SIZE,
  BOMB_SPEED,
  BOOMERANG_SIZE,
  BOOMERANG_SPEED,
  FIREBALL_SIZE,
  FIREBALL_SPEED
} from "../constants"

export default class Projectile {
  id: string = ""
  player: string = ""
  width: number = 0 // width
  height: number = 0 // height
  type: PowerType
  x: number = 0 // x-coord
  y: number = 0 // y-coord
  vx: number = 0 // x velocity
  vy: number = 0 // y velocity
  color: string = ""
  gravity: number = 0
  thrown: number = 0

  private constructor(player: Player, type: PowerType, radians: number, size: number, speed: number) {
    this.id = v4()
    this.player = player.id
    this.type = type
    this.color = player.color
    this.x = player.x + player.width * .5
    this.y = player.y + player.height * .5
    this.vx = speed * Math.cos(radians)
    this.vy = speed * Math.sin(radians)
    this.width = size
    this.height = size
    this.gravity = .4545
    this.thrown = Date.now()
  }

  isBroke = (t: MapTile): boolean => this.x < t.x + t.width
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

  static toModel = (p: Projectile): ProjectileModel => ({
    id: p.id,
    p: p.player,
    t: PowerUp.typeToString(p.type),
    c: p.color,
    x: p.x,
    y: p.y,
    w: p.width,
    h: p.height,
    vx: p.vx,
    vy: p.vy,
  })

  public static create(player: Player, type: PowerType, degrees: number) {
    const radians = (degrees * Math.PI) / 180
    let size = 0
    let speed = 0
    switch (type) {
      case PowerType.BOOMERANG:
        size = BOOMERANG_SIZE
        speed = BOOMERANG_SPEED
        break
      case PowerType.BOMB:
        size = BOMB_SIZE
        speed = BOMB_SPEED
        break
      case PowerType.FIREBALL:
        size = FIREBALL_SIZE
        speed = FIREBALL_SPEED
        break
    }
    return new Projectile(player, type, radians, size, speed)
  }
}

export interface ProjectileModel {
  id: string
  p: string
  t: string
  c: string
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
}