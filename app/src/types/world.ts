import Tile, {A, D, G, TILE, W} from "./Tile"

export default class World {

  private tiles: Tile[] = []
  private readonly bottom: number = 0

  constructor(tiles: string[][]) {
    for (let y = 0; y < tiles.length; y++) {
      for (let x = 0; x < tiles[y].length; x++) {
        this.tiles.push(new Tile(this.toMeta(tiles[y][x]), x, y))
      }
      this.bottom = y
    }
  }

  toMeta = (type: string) => {
    switch (type) {
      default:
      case "A":
        return A
      case "D":
        return D
      case "G":
        return G
      case "AS":
        const tile = A
        tile.spawn = true
        return tile
      case "W":
        return W
    }
  }

  map = () => this.tiles

  void = () => this.bottom * TILE + 1000

  blocksSolid = () => this.tiles.filter(tile => tile.solid)

  blocksWalkable = () => this.tiles.filter(tile => tile.walkable)

  blocksAir = () => this.tiles.filter(tile => !tile.walkable && !tile.solid)

  blocksWithPowerUps = () => this.tiles.filter(tile => tile.power_up !== undefined)

  randomSpawn = () => {
    const spawns = this.tiles.filter(t => t.spawn)
    const index = Math.round((spawns.length - 1) * Math.random())
    return spawns[index]
  }
}
