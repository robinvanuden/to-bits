import {v4} from "uuid"
import Tile from "./Tile"
import {Player} from "./Player"

export enum PowerType {BOOMERANG, BOMB, FIREBALL}

const POWER_WIDTH = 16
const POWER_HEIGHT = 16

export default class PowerUp {

  id: string
  width: number = POWER_WIDTH
  height: number = POWER_HEIGHT
  type: PowerType
  x: number
  y: number

  constructor(tile: Tile) {
    this.id = v4()
    this.type = PowerUp.randomType()
    this.x = tile.x + Math.round((tile.w * .5) - (POWER_WIDTH * .5))
    this.y = tile.y + Math.round((tile.h * .5) - (POWER_HEIGHT * .5))
    console.log(`Spawn PowerUp: ${this.x}x${this.y}`)
  }

  isTouching = (p: Player) =>
    this.x < p.x + p.width &&
    this.x + this.width > p.x &&
    this.y < p.y + p.height &&
    this.y + this.height > p.y

  static randomType = (): PowerType => {
    const enumValues = Object.keys(PowerType)
      .map(n => Number.parseInt(n))
      .filter(n => !Number.isNaN(n)) as unknown as PowerType[]
    return enumValues[Math.floor(Math.random() * enumValues.length)]
  }

  static typeToString = (type: PowerType) => {
    switch (type) {
      case PowerType.BOOMERANG:
        return 'RANG'
      case PowerType.BOMB:
        return "BOMB"
      case PowerType.FIREBALL:
        return "FIRE"
    }
  }

  static toModel = (power: PowerUp | undefined): PowerUpModel | undefined => {
    if (!power) {
      return undefined
    }
    return {
      id: power.id,
      w: power.width,
      h: power.height,
      x: power.x,
      y: power.y,
      t: PowerUp.typeToString(power.type),
    }
  }

  static spawnPower = (tile: Tile) => {
    if (tile.hasPowerUp()) {
      return
    }
    const random = Math.round(Math.random() * 10000)
    if (random !== 1) {
      return
    }
    tile.power_up = new PowerUp(tile)
  }
}

export interface PowerUpModel {
  id: string
  w: number
  h: number
  x: number
  y: number
  t: string
}