import {MetaTile, metaToTile, Tile} from "../types/tile"
import {TILE} from "./tiles"
import {Player} from "../types/player"
import {Boomerang} from "../types/boomerang"

export default class GameMap {

  map: Tile[] = []
  bottom: number = 0

  constructor(tiles: MetaTile[][]) {
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        this.map.push(metaToTile(tiles[y][x], x, y))
      }
      this.bottom = y
    }
  }

  getMap = () => this.map

  getVoid = (() => (this.bottom * TILE) + 1000)

  getBlocks = () => this.map.filter(tile => tile.t === 1)


  randomSpawn = () => {
    const spawns = this.map.filter(t => t.t === 9)
    const index = Math.round((spawns.length - 1) * Math.random())
    return spawns[index]
  }
  isCollidingWithMap = (player: Player): boolean => {
    for (const tile of this.getBlocks()) {
      if (player.isColliding(tile)) {
        return true
      }
    }
    return false
  }

  isBrokeOnMap = (boomerang: Boomerang): boolean => {
    for (const tile of this.getBlocks()) {
      if (boomerang.isBroke(tile)) {
        return true
      }
    }
    return false
  }

  isWalkingOnMap = (player: Player): boolean => {
    for (const tile of this.getBlocks()) {
      if (player.isWalkingOn(tile)) {
        return true
      }
    }
    return false
  }
}
