import {MetaTile, metaToTile, Tile} from "../types/tile"
import {TILE} from "./tiles"

export default class World {

  private tiles: Tile[] = []
  private readonly bottom: number = 0

  constructor(tiles: MetaTile[][]) {
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        this.tiles.push(metaToTile(tiles[y][x], x, y))
      }
      this.bottom = y
    }
  }

  map = () => this.tiles

  void = () => this.bottom * TILE + 1000

  getSolidBlocks = () => this.tiles.filter(tile => tile.t === 1)

  getWalkableBlocks = () => this.tiles.filter(tile => tile.t === 1 || tile.t === 2)

  randomSpawn = () => {
    const spawns = this.tiles.filter(t => t.t === 9)
    const index = Math.round((spawns.length - 1) * Math.random())
    return spawns[index]
  }
}
