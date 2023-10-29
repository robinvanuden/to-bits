import PowerUp from "../types/PowerUp"
import Tile from "../types/Tile"

export default class PowerUpController {

  private __list: PowerUp[] = []

  list = () => this.__list

  spawnPower = (tile: Tile): PowerUp => {
    const power_up = new PowerUp(tile)
    this.__list.push(power_up)
    return tile.power_up = power_up
  }

  clean = () => {
    this.__list = []
  }

  remove = (power: PowerUp) => this.__list = this.__list.filter(p => p.id !== power.id)
}