import Player from "./Player"
import MapTile from "./MapTile"
import PowerUp, {PowerType} from "./PowerUp"
import {v4} from "uuid"
import {
  BOMB_SIZE,
  BOOMERANG_SIZE,
  BOOMERANG_SPEED,
  FIREBALL_SIZE,
  FIREBALL_SPEED,
  GRAVITY
} from "../constants"
import ProjectileModel from "../types/ProjectileModel"

export default class Projectile {
  id: string = ""
  player: string = ""
  width: number // width
  height: number // height
  type: PowerType
  x: number = 0 // x-coord
  y: number = 0 // y-coord
  vx: number // x velocity
  vy: number // y velocity
  color: string = ""
  gravity: number = 0
  thrown: number = 0

  private constructor(player: Player, type: PowerType, radians: number) {
    this.id = v4()
    this.player = player.id
    this.type = type
    this.color = player.color
    this.x = player.x + player.width * .5
    this.y = player.y + player.height * .5
    this.thrown = Date.now()
    switch (type) {
      case PowerType.BOOMERANG:
        this.gravity = 0
        this.width = this.height = BOOMERANG_SIZE
        this.vx = BOOMERANG_SPEED * Math.cos(radians)
        this.vy = BOOMERANG_SPEED * Math.sin(radians)
        break
      case PowerType.BOMB:
        this.gravity = GRAVITY
        this.width = this.height = BOMB_SIZE
        this.vx = 0
        this.vy = 0
        break
      case PowerType.FIREBALL:
        this.gravity = 0
        this.width = this.height = FIREBALL_SIZE
        this.vx = FIREBALL_SPEED * Math.cos(radians)
        this.vy = FIREBALL_SPEED * Math.sin(radians)
        break
    }
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
    return new Projectile(player, type, radians)
  }
}

