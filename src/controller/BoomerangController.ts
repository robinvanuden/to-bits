import {Player} from "../types/player"
import {v4} from "uuid"
import {Boomerang} from "../types/boomerang"

export default class BoomerangController {

  private __boomerangs: Boomerang[] = []

  list = () => this.__boomerangs

  create = (player: Player, degrees: number) => {
    const radians = (degrees * Math.PI) / 180
    this.__boomerangs.push(new Boomerang(
      v4(),
      player,
      player.x + player.w * .5,
      player.y + player.h * .5,
      radians
    ))
  }

  deleteFrom = (player: Player) => {
    this.__boomerangs = this.__boomerangs.filter(b => b.player !== player.id)
  }

  delete = (boomerang: Boomerang) => {
    this.__boomerangs = this.__boomerangs.filter(b => b.id !== boomerang.id)
  }
}