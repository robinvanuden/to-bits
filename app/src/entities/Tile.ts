import PowerUp from "./PowerUp"
import {PROP_SEMI_SOLID, TileSetItem, TileSetProperty} from "../types/TileSet"
import Player from "./Player"
import {WorldLayer} from "../types/World"
import {TileModel} from "../types/TileModel"

export const TILE_SIZE = 48

export default class Tile {
  id: number
  x: number
  y: number
  name: string
  source: string
  offset_x: number
  offset_y: number
  tileheight: number
  tilewidth: number
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
    this.name = item.name
    this.source = item.source
    this.offset_x = item.offset_x
    this.offset_y = item.offset_y
    this.tilewidth = item.tilewidth
    this.tileheight = item.tileheight
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

  private generateAssetUrl = () => {
    const body = {layer: this.layer, tile_id: this.id}
    const hash = Buffer.from(JSON.stringify(body), "utf-8").toString("base64url")
    return "/texture/" + hash + ".webp"
  }

  static toModel = (tile: Tile): TileModel => ({
    x: tile.x,
    y: tile.y,
    w: tile.width,
    h: tile.height,
    t: tile.id,
    i: tile.generateAssetUrl(),
    d: 0,
    sp: tile.layer === "spawn",
    wa: tile.isSemiSolid(),
    so: !tile.isSemiSolid(),
    pu: PowerUp.toMaybeModel(tile.power_up)
  })
}