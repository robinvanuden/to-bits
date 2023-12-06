import {Player} from "./Player"
import PowerUp, {PowerUpModel} from "./PowerUp"

export default class Tile {
  x: number
  y: number
  w: number // width
  h: number // height
  type: number // type
  color: string // color
  image: string | undefined
  damage: number // damage
  spawn: boolean // spawn
  walkable: boolean // walkable
  solid: boolean // solid
  power_up: PowerUp | undefined

  constructor(meta: MetaTile, x: number, y: number) {
    this.x = x * meta.w
    this.y = y * meta.h
    this.w = meta.w
    this.h = meta.h
    this.type = meta.type
    this.color = meta.color
    this.image = meta.image
    this.damage = meta.damage
    this.spawn = meta.spawn
    this.walkable = meta.walkable
    this.solid = meta.solid
  }

  hasPowerUp = (): boolean => this.power_up !== undefined

  isColliding = (p: Player): boolean =>
    this.x < p.x + p.width &&
    this.x + this.w > p.x &&
    this.y < p.y + p.height &&
    this.y + this.h > p.y

  isAboutWalking = (p: Player): boolean =>
    this.x < p.x + p.width &&
    this.x + this.w > p.x &&
    this.y < p.y + p.height &&
    this.y + 1 > p.y

  spawnPower = () => {
    if (this.hasPowerUp()) {
      return
    }
    this.power_up = new PowerUp(this)
  }

  static toModel = (tile: Tile): TileModel => ({
    x: tile.x,
    y: tile.y,
    w: tile.w,
    h: tile.h,
    t: tile.type,
    c: tile.color,
    i: tile.image,
    d: tile.damage,
    sp: tile.spawn,
    wa: tile.walkable,
    so: tile.solid,
    pu: PowerUp.toMaybeModel(tile.power_up)
  })
}

export interface TileModel {
  x: number
  y: number
  w: number // width
  h: number // height
  t: number // type
  c: string // color
  i: string | undefined
  d: number // damage
  sp: boolean // spawn
  wa: boolean // walkable
  so: boolean // solid
  pu: PowerUpModel | undefined
}

export interface MetaTile {
  type: number // type
  w: number // width
  h: number // height
  color: string // color
  image: string | undefined
  spawn: boolean // spawn
  solid: boolean // solid
  walkable: boolean // walkable
  damage: number // damage
}


const GRASS = 'grass'
const DIRT = 'dirt'
const WOOD = 'wood'

export const TILE = 48
export const A: MetaTile = {
  w: TILE,
  h: TILE,
  damage: 0,
  color: "rgba(0,0,0,0)",
  image: undefined,
  type: 0,
  spawn: false,
  solid: false,
  walkable: false
} // 0: Air
export const G: MetaTile = {
  w: TILE,
  h: TILE,
  damage: 0,
  color: "#cad44f",
  image: GRASS,
  type: 1,
  spawn: false,
  solid: true,
  walkable: true
} // 1: Ground
export const D: MetaTile = {
  w: TILE,
  h: TILE,
  damage: 0,
  color: "#743722",
  image: DIRT,
  type: 1,
  spawn: false,
  solid: true,
  walkable: true,
} // 1: Ground
export const W: MetaTile = {
  w: TILE,
  h: TILE,
  damage: 0,
  color: "#daa35a",
  image: WOOD,
  type: 2,
  spawn: false,
  walkable: true,
  solid: false
} // 1: Ground