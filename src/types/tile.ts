import {Player} from "./player"

export default class Tile {
  x: number
  y: number
  t: number // type
  w: number // width
  h: number // height
  c: string // color
  i: string | undefined
  s: boolean // spawn
  d: number // damage

  constructor(meta: MetaTile, x: number, y: number) {
    this.x = x * meta.w
    this.y = y * meta.h
    this.t = meta.t
    this.w = meta.w
    this.h = meta.h
    this.c = meta.c
    this.i = meta.i
    this.s = meta.s
    this.d = meta.d
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