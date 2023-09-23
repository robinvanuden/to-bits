import {Tile, Map} from "./types/map"

const TILE = 24
const TA = 0
const TB = 1
const TS = 9

const MAP_RAW = [
  [TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA],
  [TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA],
  [TA, TA, TS, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA],
  [TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA],
  [TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA],
  [TA, TB, TB, TB, TB, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA],
  [TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA],
  [TA, TA, TA, TA, TA, TA, TA, TB, TA, TA, TA, TA, TA, TA, TA, TB, TA, TA, TA, TA],
  [TA, TA, TA, TA, TA, TA, TA, TB, TB, TB, TB, TB, TB, TB, TB, TB, TA, TA, TA, TA],
  [TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA],
  [TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA],
  [TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA],
  [TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA],
  [TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA],
  [TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA],
  [TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA],
  [TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA],
  [TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA],
  [TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA],
  [TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA, TA],
]

const toMap = () => {
  const map: Tile[] = []
  for (let y = 0; y < MAP_RAW.length; y++) {
    for (let x = 0; x < MAP_RAW[y].length; x++) {
      const type = MAP_RAW[y][x]
      map.push({
        t: type, x: x * TILE, y: y * TILE, w: TILE, h: TILE
      })
    }
  }
  return map
}

export const MAP: Map = {
  w: MAP_RAW.length * TILE,
  h: MAP_RAW[0].length * TILE,
  t: toMap()
}