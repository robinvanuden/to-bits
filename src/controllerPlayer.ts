import {Tile} from "./types/map"
import {Player} from "./types/player"

const TILE_PLAYER = 16


export const createPlayer = (spawn: Tile, id: string, address: string): Player => {
  return {
    id: id,
    address: address,
    connected: true,
    color: "#FF00FF",
    name: "Robin",
    w: TILE_PLAYER,
    h: TILE_PLAYER,
    x: spawn.x,
    y: spawn.y,
    vx: 0,
    vy: 0,
    canJump: true,
    direction: {
      u: false,
      d: false,
      l: false,
      r: false
    }
  }
}