import {MetaTile} from "../types/tile"


const GRASS = 'grass'
const DIRT = 'dirt'
const WOOD = 'wood'

export const TILE = 48
export const A: MetaTile = {
  w: TILE,
  h: TILE,
  s: false,
  d: 0,
  c: "#000",
  i: undefined,
  t: 0
} // 0: Air
export const G: MetaTile = {
  w: TILE,
  h: TILE,
  s: false,
  d: 0,
  c: "#000",
  i: GRASS,
  t: 1
} // 1: Ground
export const D: MetaTile = {
  w: TILE,
  h: TILE,
  s: false,
  d: 0,
  c: "#000",
  i: DIRT,
  t: 1
} // 1: Ground
export const W: MetaTile = {
  w: TILE,
  h: TILE,
  s: false,
  d: 0,
  c: "#000",
  i: WOOD,
  t: 2
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