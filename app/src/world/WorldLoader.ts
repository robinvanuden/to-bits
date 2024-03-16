import World, {WorldLayer} from "../types/World"
import * as path from "path"
import * as fs from "fs"
import TileSet, {TileSetItem} from "../types/TileSet"
import Tile, {TILE_SIZE} from "../entities/Tile"
import Player from "../entities/Player"
import {TileLayerModel} from "../types/TileModel"

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

  randomSpawn = (): Tile | undefined => {
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

  isPlayerInVoid = (player: Player): boolean => (player.y + player.height) > (this.world.height * TILE_SIZE)

  layers = (): TileLayerModel[] => [this.floor().toModel(), this.powers().toModel()]
}

class TileSetLoader {

  private readonly _name: string
  private readonly _first_id: number
  private readonly _last_id: number = 0
  private _set: TileSet
  private _tiles: TileSetItem[] = []

  constructor(name: string, index: number) {
    this._first_id = this._last_id = index
    this._set = this.loadJsonTileSet(name)
    this._name = path.basename(name)

    let id = 0
    for (let r = 0; r < Math.round(this._set.imageheight / this._set.tileheight); r++) {
      for (let c = 0; c < Math.round(this._set.imagewidth / this._set.tilewidth); c++) {
        this._last_id = id
        this._tiles.push({
          id: id,
          tile_id: index + id,
          width: this._set.tilewidth,
          height: this._set.tileheight,
          name: this._set.name,
          source: this._set.image,
          offset_x: c * this._set.tilewidth,
          offset_y: r * this._set.tileheight,
          tilewidth: this._set.tilewidth,
          tileheight: this._set.tileheight,
          type: this._set.type,
          version: this._set.version,
          tiledversion: this._set.tiledversion,
          properties: this._set.properties
        })
        id++
      }
    }
  }

  public firstId = () => this._first_id

  public name = () => this._name

  loadJsonTileSet = (name: string): TileSet => JSON.parse(fs.readFileSync(path.resolve(__dirname, "../map/", name)).toString("utf-8"))

  getTileById = (id: number) => this._tiles.find(t => t.tile_id === id)

}

class LayerLoader {

  private readonly _name: string = ""
  private _tiles: Tile[] = []

  public tiles = (): Tile[] => this._tiles || []

  public name = () => this._name

  public solids = (): Tile[] => this.tiles().filter(t => !t.isSemiSolid())

  public semis = (): Tile[] => this.tiles().filter(t => t.isSemiSolid())

  constructor(layer: WorldLayer, sets: TileSetLoader[]) {
    this._name = layer.name
    let c = 0
    for (let y = 0; y < layer.height; y++) {
      for (let x = 0; x < layer.width; x++) {
        const id = layer.data[c]
        const item = sets.find(s => id >= s.firstId() && s.getTileById(id))?.getTileById(id)
        if (item) this._tiles.push(new Tile(id, x, y, layer, item))
        c++
      }
    }
    console.log("Loaded layer:", layer.name, this._tiles.length)
  }

  public toModel = (): TileLayerModel => ({
    n: this.name(),
    ls: this.tiles().map(Tile.toModel)
  })
}

let world1: WorldLoader | undefined = undefined

export const useWorld1 = () => world1 ? world1 : (world1 = new WorldLoader('world1'))
