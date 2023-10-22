import Tile, {MetaTile, TILE} from "./tile"

export default class World {

  private tiles: Tile[] = []
  private readonly bottom: number = 0

  constructor(tiles: MetaTile[][]) {
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        this.tiles.push(new Tile(tiles[y][x], x, y))
      }
      this.bottom = y
    }
  }

  map = () => this.tiles

  void = () => this.bottom * TILE + 1000

  blocksSolid = () => this.tiles.filter(tile => tile.t === 1)

  blocksWalkable = () => this.tiles.filter(tile => tile.t === 1 || tile.t === 2)

  randomSpawn = () => {
    const spawns = this.tiles.filter(t => t.t === 9)
    const index = Math.round((spawns.length - 1) * Math.random())
    return spawns[index]
  }
}
