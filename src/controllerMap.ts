import {Tile} from "./types/map"

const TILE = 32
const A = 0 // 0: Air
const B = 1 // 1: Ground
const S = 9 // 9: Spawn

let bottom = 0

const MAP_RAW = [
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, S, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, S, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, B, B, B, B, B, A, A, A, A, A, A, A, A, A, B, B, B, B, B, A, A, A, A, A, A, A, A, B, B, B],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, B, B, B, B, B, B, B, A, A, A, A, B, B, B, B, B, B, B, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, B, B, B, B, B, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, B, B, B, B, B, A, A, A, A, A, A, A, A, A, B, B, A, A, A, A, A, A, A, A, A, B, B],
  [A, A, A, A, A, B, B, B, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, B, B, B, A, A, A, A, A, A, A, A, A, B, B, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, B, A, A, A, A, A, A, A, A, A, A, B, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, B, B, B, B, A, A, A, A, A, A, A, B, B, B, B, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, B, B, A, A, A, B, B, A, A, A, A, A, B, B, A, A, B, B, A, A, A, A, A, B, B, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [B, B, B, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
  [A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A, A],
]

const toMap = () => {
  const map: Tile[] = []
  for (let y = 0; y < MAP_RAW.length; y++) {
    for (let x = 0; x < MAP_RAW[y].length; x++) {
      const type = MAP_RAW[y][x]
      map.push({
        t: type, x: x * TILE, y: y * TILE, w: TILE, h: TILE, c: "#2d1e1a"
      })
    }
    bottom = y
  }
  console.log(bottom)
  return map
}

export const NETHER = (() => (bottom * TILE) + 1000)()

export const MAP = toMap()