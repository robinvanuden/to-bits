import {Player} from "../types/player"
import {v4} from "uuid"
import {Boomerang} from "../types/boomerang"

export const createBoomerang = (player: Player, degrees: number): Boomerang => {
  console.log("degrees", degrees)
  const radians = (degrees * Math.PI) / 180
  return new Boomerang(
    v4(),
    player.id,
    player.x + player.w * .5,
    player.y + player.h * .5,
    radians
  )
}