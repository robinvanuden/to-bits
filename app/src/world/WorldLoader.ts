import World from "../types/World"
import * as path from "path"
import * as fs from "fs"
import MapTile from "../entities/MapTile"
import Player from "../entities/Player"
import TileSetLoader from "./TileSetLoader"
import LayerLoader from "./LayerLoader"

export default class WorldLoader {

  private world: World
  private sets: TileSetLoader[] = []

  private readonly _spawns!: LayerLoader
  private readonly _powers!: LayerLoader
  private readonly _floor!: LayerLoader

  public spawns = (): LayerLoader => this._spawns
  public powers = (): LayerLoader => this._powers
  public floor = (): LayerLoader => this._floor

  constructor(name: string) {
    this.world = this.loadJsonMap(name + ".json")
    for (const set of this.world.tilesets) {
      this.sets.push(new TileSetLoader(set.source, set.firstgid))
    }
    for (const layer of this.world.layers) {
      switch (layer.name) {
        case "floor":
          this._floor = new LayerLoader(layer, this.sets)
          break
        case "powers":
          this._powers = new LayerLoader(layer, this.sets)
          break
        case "spawns":
          this._spawns = new LayerLoader(layer, this.sets)
          break
      }
    }
  }

  loadJsonMap = (name: string): World => JSON.parse(fs.readFileSync(path.resolve(__dirname, "../map/", name)).toString("utf-8"))

  randomSpawn = (): MapTile | undefined => {
    const spawns = this.spawns().tiles().filter(t => t !== undefined)
    const picked = Math.ceil(Math.random() * spawns.length) - 1
    return spawns[picked] || spawns[0] || undefined
  }

  clearPowerUps = () => {
    for (const tile of this.powers().tiles()) {
      tile.power_up = undefined
    }
    console.log("Cleared power-ups")
  }

  isPlayerInVoid = (player: Player): boolean => (player.y + player.height) > (this.world.height * this.world.tileheight)
}

let world1: WorldLoader | undefined = undefined

export const useWorld1 = () => world1 ? world1 : (world1 = new WorldLoader('world1'))
