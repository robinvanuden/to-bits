import PowerUp, {PowerUpModel} from "./PowerUp"
import {Player} from "./Player"
import {TileSetProperty} from "./TileSet"

export class Tile {
  id: number
  x: number
  y: number
  type: string
  version: string
  tiledversion: string
  height: number
  width: number
  layer: string
  power_up: PowerUp | undefined
  properties: TileSetProperty[] | undefined

  constructor(id: number, x: number, y: number, type: string, version: string, tiledversion: string, height: number, width: number, layer: string, properties: TileSetProperty[] | undefined) {
    this.id = id
    this.x = x
    this.y = y
    this.type = type
    this.version = version
    this.tiledversion = tiledversion
    this.height = height
    this.width = width
    this.layer = layer
    this.power_up = undefined
    this.properties = properties
  }

  public isColliding = (p: Player): boolean =>
    this.x < p.x + p.width &&
    this.x + this.width > p.x &&
    this.y < p.y + p.height &&
    this.y + this.height > p.y

  public isAboutWalking = (p: Player): boolean =>
    this.x < p.x + p.width &&
    this.x + this.width > p.x &&
    this.y < p.y + p.height &&
    this.y + 1 > p.y

  public hasPowerUp = (): boolean => this.power_up !== undefined

  public spawnPower = () => {
    if (!this.hasPowerUp()) this.power_up = new PowerUp(this)
  }

  static toModel = (tile: Tile): TileModel => ({
    x: tile.x,
    y: tile.y,
    w: tile.width,
    h: tile.height,
    t: tile.id,
    i: "dirt",
    d: 0,
    sp: tile.layer === "spawn",
    wa: tile.layer === "floor",
    so: false,
    pu: PowerUp.toMaybeModel(tile.power_up)
  })
}

export interface TileModel {
  x: number
  y: number
  w: number // width
  h: number // height
  t: number // type
  i: string | undefined
  d: number // damage
  sp: boolean // spawn
  wa: boolean // walkable
  so: boolean // solid
  pu: PowerUpModel | undefined
}