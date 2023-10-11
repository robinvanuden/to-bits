import {Boomerang, Player} from "../types/player"
import {v4} from "uuid"

const BOOMERANG_SIZE = 14
const BOOMERANG_THROW = 20

export const createBoomerang = (player: Player, degrees: number): Boomerang => {
  console.log("degrees", degrees)
  const radians = (degrees * Math.PI) / 180
  return {
    id: v4(),
    player: player.id,
    x: player.x,
    y: player.y,
    vx: BOOMERANG_THROW * Math.cos(radians),
    vy: BOOMERANG_THROW * Math.sin(radians),
    w: BOOMERANG_SIZE,
    h: BOOMERANG_SIZE,
    gravity: .4545,
    thrown: Date.now()
  }
}