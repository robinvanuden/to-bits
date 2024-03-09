import PowerUp, {PowerUpModel} from "./PowerUp"
import {Player} from "./Player"
import {PROP_SEMI_SOLID, TileSetItem, TileSetProperty} from "./TileSet"
import {WorldLayer} from "./World"

export const TILE_SIZE = 48

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
  properties: TileSetProperty[]

  constructor(id: number, x: number, y: number, layer: WorldLayer, item: TileSetItem) {
    this.id = id
    this.x = x * TILE_SIZE
    this.y = y * TILE_SIZE
    this.type = item.type
    this.version = item.version
    this.tiledversion = item.tiledversion
    this.height = TILE_SIZE
    this.width = TILE_SIZE
    this.layer = layer.name
    this.power_up = undefined
    this.properties = item.properties || []
  }

  isColliding = (p: Player): boolean =>
    this.x < p.x + p.width &&
    this.x + this.width > p.x &&
    this.y < p.y + p.height &&
    this.y + this.height > p.y

  isAboutWalking = (p: Player): boolean =>
    this.x < p.x + p.width &&
    this.x + this.width > p.x &&
    this.y < p.y + p.height &&
    this.y + 1 > p.y

  public hasPowerUp = (): boolean => this.power_up !== undefined

  public isSemiSolid = (): boolean => this.properties.find(p => p.name === PROP_SEMI_SOLID && p.value) != undefined

  public spawnPower = () => {
    if (!this.hasPowerUp()) this.power_up = new PowerUp(this)
  }

  static toModel = (tile: Tile): TileModel => ({
    x: tile.x,
    y: tile.y,
    w: tile.width,
    h: tile.height,
    t: tile.id,
    i: tile.isSemiSolid() ? "wood" : "dirt",
    d: 0,
    sp: tile.layer === "spawn",
    wa: tile.isSemiSolid(),
    so: !tile.isSemiSolid(),
    pu: PowerUp.toMaybeModel(tile.power_up)
  })
}

export interface TileModel {
  x: number
  y: number
  // width
  w: number
  // height
  h: number
  // type
  t: number
  i: string | undefined
  // damage
  d: number
  // spawn
  sp: boolean
  // walkable
  wa: boolean
  // solid
  so: boolean
  pu: PowerUpModel | undefined
}