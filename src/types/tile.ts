import {Player} from "./player"

export default class Tile {
  x: number
  y: number
  t: number // type
  w: number // width
  h: number // height
  color: string // color
  i: string | undefined
  spawn: boolean // spawn
  damage: number // damage

  constructor(meta: MetaTile, x: number, y: number) {
    this.x = x * meta.w
    this.y = y * meta.h
    this.t = meta.t
    this.w = meta.w
    this.h = meta.h
    this.color = meta.c
    this.i = meta.i
    this.spawn = meta.s
    this.damage = meta.d
  }

  isColliding = (p: Player): boolean =>
    this.x < p.x + p.w &&
    this.x + this.w > p.x &&
    this.y < p.y + p.h &&
    this.y + this.h > p.y

  isAboutWalking = (p: Player): boolean =>
    this.x < p.x + p.w &&
    this.x + this.w > p.x &&
    this.y < p.y + p.h &&
    this.y + 1 > p.y
}

export interface MetaTile {
  t: number // type
  w: number // width
  h: number // height
  c: string // color
  i: string | undefined
  s: boolean // spawn
  d: number // damage
}


const GRASS = 'grass'
const DIRT = 'dirt'
const WOOD = 'wood'

export const TILE = 48
export const A: MetaTile = {
  w: TILE,
  h: TILE,
  s: false,
  d: 0,
  c: "rgba(0,0,0,0)",
  i: undefined,
  t: 0
} // 0: Air
export const G: MetaTile = {
  w: TILE,
  h: TILE,
  s: false,
  d: 0,
  c: "#cad44f",
  i: GRASS,
  t: 1
} // 1: Ground
export const D: MetaTile = {
  w: TILE,
  h: TILE,
  s: false,
  d: 0,
  c: "#743722",
  i: DIRT,
  t: 1
} // 1: Ground
export const W: MetaTile = {
  w: TILE,
  h: TILE,
  s: false,
  d: 0,
  c: "#daa35a",
  i: WOOD,
  t: 2
} // 1: Ground
export const S: MetaTile = {
  w: TILE,
  h: TILE,
  s: false,
  d: 0,
  c: "rgba(0,0,0,0)",
  i: undefined,
  t: 9
} // 9: Spawn