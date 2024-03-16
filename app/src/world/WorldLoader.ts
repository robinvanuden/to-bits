import World from "../types/World"
import * as path from "path"
import * as fs from "fs"
import MapTile from "../entities/MapTile"
import Player from "../entities/Player"
import TileSetLoader from "./TileSetLoader"
import LayerLoader from "./LayerLoader"
import {v4} from "uuid"

export default class WorldLoader {

  private world: World
  private sets: TileSetLoader[] = []

  private readonly _seed!: string
  private readonly _spawns!: LayerLoader
  private readonly _powers!: LayerLoader
  private readonly _floor!: LayerLoader

  public seed = () => this._seed
  public spawns = () => this._spawns
  public powers = () => this._powers
  public floor = () => this._floor

  public findSetByName = (name: string) => this.sets.find(s => {
    return path.basename(name).replace(path.extname(name), "") === path.basename(s.source()).replace(path.extname(s.source()), "")
  }) || undefined

  public findLayerByName = (name: string) => {
    switch (name) {
      case "floor":
        return this.floor()
      case "powers":
        return this.powers()
      case "spawns":
        return this.spawns()
    }
  }

  constructor(name: string) {
    this._seed = v4()
    this.world = this.loadJsonMap(name + ".json")
    for (const set of this.world.tilesets) {
      this.sets.push(new TileSetLoader(set.source, set.firstgid))
    }
    for (const layer of this.world.layers) {
      switch (layer.name) {
        case "floor":
          this._floor = new LayerLoader(layer, this.sets, this.seed())
          break
        case "powers":
          this._powers = new LayerLoader(layer, this.sets, this.seed())
          break
        case "spawns":
          this._spawns = new LayerLoader(layer, this.sets, this.seed())
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
