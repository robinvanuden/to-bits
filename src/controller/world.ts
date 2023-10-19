import {MetaTile, metaToTile, Tile} from "../types/tile"
import {TILE} from "./tiles"

export default class World {

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

  getSolidBlocks = () => this.map.filter(tile => tile.t === 1)

  getWalkableBlocks = () => this.map.filter(tile => tile.t === 1 || tile.t === 2)

  randomSpawn = () => {
    const spawns = this.map.filter(t => t.t === 9)
    const index = Math.round((spawns.length - 1) * Math.random())
    return spawns[index]
  }
}
