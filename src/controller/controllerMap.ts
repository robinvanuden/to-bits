import {MetaTile, metaToTile, Tile} from "../types/map"

const GRASS = 'grass'

const TILE = 64
const A: MetaTile = {
  w: TILE,
  h: TILE,
  s: false,
  d: 0,
  c: "#000",
  i: undefined,
  t: 0
} // 0: Air
const B: MetaTile = {
  w: TILE,
  h: TILE,
  s: false,
  d: 0,
  c: "#000",
  i: GRASS,
  t: 1
} // 1: Ground
const S: MetaTile = {
  w: TILE,
  h: TILE,
  s: false,
  d: 0,
  c: "#000",
  i: undefined,
  t: 9
} // 9: Spawn

let bottom = 0

const MAP_RAW = [
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, S, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, S, A, A, A],
  [A, B, B, B, B, B, A, A, A, A, A, A, B, B, B, B, B, B, A, A, A, A, A, A, B, B, B, B, B, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, B, B, B, A, A, A, A, A, A, A, A, B, B, B, B, B, B, B, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, B, B, B, B, A, A, A, A, A, A, A, A, A, B, B, A, A, A, A, A, A, A, A, A, B, B],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, B, B, A, A, A, A, A, A, A, A, B, B, B, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, S, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, B, B, B, B, A, A, A, A, A, A, A, B, B, B, B, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, B, B, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, B, B, A, A, B, B, A, A, A, A, A, A, A, A, A, B, B, A, A, A, A, A, B, B, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [B, B, B, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
]

const toMap = () => {
  const map: Tile[] = []
  for (let y = 0; y < MAP_RAW.length; y++) {
    for (let x = 0; x < MAP_RAW[y].length; x++) {
      map.push(metaToTile(MAP_RAW[y][x], x, y))
    }
    bottom = y
  }
  return map
}

export const MAP = toMap()

export const VOID = (() => (bottom * TILE) + 1000)()
