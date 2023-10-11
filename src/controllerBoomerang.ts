import {Boomerang, Player} from "./types/player"
import {v4} from "uuid"

const BOOMERANG_SIZE = 14
const BOOMERANG_THROW = 12

const degreesToVelocity = (degrees: number, speed: number) => {
  const radians = (degrees * Math.PI) / 180
  return {
    vx: speed * Math.cos(radians),
    vy: speed * Math.sin(radians),
  }
}

export const createBoomerang = (player: Player, degrees: number): Boomerang => {
  console.log("degrees", degrees)
  const {vx, vy} = degreesToVelocity(degrees, BOOMERANG_THROW)
  return {
    id: v4(),
    player: player.id,
    x: player.x,
    y: player.y,
    vx: vx,
    vy: vy,
    w: BOOMERANG_SIZE,
    h: BOOMERANG_SIZE,
    gravity: .4545,
    thrown: Date.now()
  }
}