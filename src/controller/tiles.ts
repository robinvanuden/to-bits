import {MetaTile} from "../types/tile"


const GRASS = 'grass'

export const TILE = 64
export const A: MetaTile = {
  w: TILE,
  h: TILE,
  s: false,
  d: 0,
  c: "#000",
  i: undefined,
  t: 0
} // 0: Air
export const B: MetaTile = {
  w: TILE,
  h: TILE,
  s: false,
  d: 0,
  c: "#000",
  i: GRASS,
  t: 1
} // 1: Ground
export const S: MetaTile = {
  w: TILE,
  h: TILE,
  s: false,
  d: 0,
  c: "#000",
  i: undefined,
  t: 9
} // 9: Spawn