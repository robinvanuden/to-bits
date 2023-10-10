export interface MetaTile {
  t: number // type
  w: number // width
  h: number // height
  c: string // color
  s: boolean // spawn
  d: number // damage
}

export interface Tile extends MetaTile {
  x: number
  y: number
}

export const metaToTile = (meta: MetaTile, x: number, y: number): Tile => ({
  t: meta.t,
  w: meta.w,
  h: meta.h,
  c: meta.c,
  d: meta.d,
  s: meta.s,
  x: x * meta.w,
  y: y * meta.h
})