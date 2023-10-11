import {Player} from "../types/player"
import {v4} from "uuid"
import {Boomerang} from "../types/boomerang"

const BOOMERANG_SIZE = 14
const BOOMERANG_THROW = 20

export const createBoomerang = (player: Player, degrees: number): Boomerang => {
  console.log("degrees", degrees)
  const radians = (degrees * Math.PI) / 180
  const boomerang = new Boomerang()
  boomerang.id = v4()
  boomerang.player = player.id
  boomerang.x = player.x
  boomerang.y = player.y
  boomerang.vx = BOOMERANG_THROW * Math.cos(radians)
  boomerang.vy = BOOMERANG_THROW * Math.sin(radians)
  boomerang.w = BOOMERANG_SIZE
  boomerang.h = BOOMERANG_SIZE
  boomerang.gravity = .4545
  boomerang.thrown = Date.now()
  return boomerang
}