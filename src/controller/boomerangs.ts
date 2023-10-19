import {Player} from "../types/player"
import {v4} from "uuid"
import {Boomerang} from "../types/boomerang"

export default class Boomerangs {

  private __boomerangs: Boomerang[] = []

  listAll = () => this.__boomerangs

  listOthers = (player: Player) => this.listAll().filter(b => b.player !== player.id)

  list = (player: Player) => this.listAll().filter(b => b.player === player.id)

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
    console.log("Delete boomerang from: ", player.id)
    this.__boomerangs = this.__boomerangs.filter(b => b.player !== player.id)
  }

  delete = (boomerang: Boomerang) => {
    console.log("Delete boomerang: ", boomerang.id)
    this.__boomerangs = this.__boomerangs.filter(b => b.id !== boomerang.id)
  }
}