import {Boomerang, Player} from "./types/player"
import {v4} from "uuid"
import {GRAVITY} from "./constants"

const BOOMERANG_SIZE = 10
const BOOMERANG_THROW = 12

export const createBoomerang = (player: Player, degrees: number): Boomerang => {
  let vx = 0 // BOOMERANG_THROW // Math.cos(degrees) * BOOMERANG_THROW
  let vy = 0 // BOOMERANG_THROW // Math.sin(degrees) * BOOMERANG_THROW

  const part = 350 / 8

  // if (degrees < 90) {
  //   vx += BOOMERANG_THROW
  //   vy += BOOMERANG_THROW
  // } else if (degrees < 180) {
  //   vx -= BOOMERANG_THROW
  //   vy += BOOMERANG_THROW
  // } else if (degrees < 270) {
  //   vx -= BOOMERANG_THROW
  //   vy -= BOOMERANG_THROW
  // } else {
  //   vx += BOOMERANG_THROW
  //   vy -= BOOMERANG_THROW
  // }

  if (degrees < part) {
    vx += BOOMERANG_THROW
    vy += BOOMERANG_THROW
  } else if (degrees < 180) {
    vx -= BOOMERANG_THROW
    vy += BOOMERANG_THROW
  } else if (degrees < 270) {
    vx -= BOOMERANG_THROW
    vy -= BOOMERANG_THROW
  } else {
    vx += BOOMERANG_THROW
    vy -= BOOMERANG_THROW
  }
  console.log("vx", vx, "vy", vy, "degrees", degrees)

  return {
    id: v4(),
    player: player.id,
    x: player.x,
    y: player.y,
    vx: vx,
    vy: vy,
    w: BOOMERANG_SIZE,
    h: BOOMERANG_SIZE,
    gravity: GRAVITY
  }
}