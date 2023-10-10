import {Boomerang, Player} from "./types/player"
import {v4} from "uuid"

const BOOMERANG_SIZE = 10
const BOOMERANG_THROW = 12

export const createBoomerang = (player: Player, degrees: number): Boomerang => {
  console.log("degrees", degrees)
  return {
    id: v4(),
    player: player.id,
    x: player.x,
    y: player.y,
    vx: Math.cos(degrees) * BOOMERANG_THROW,
    vy: Math.sin(degrees) * BOOMERANG_THROW,
    w: BOOMERANG_SIZE,
    h: BOOMERANG_SIZE,
    gravity: .4545,
    thrown: Date.now()
  }
}