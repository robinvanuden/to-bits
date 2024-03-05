import World, {WorldLayer} from "../types/World"
import * as path from "path"
import * as fs from "fs"
import TileSet, {TileSetItem} from "../types/TileSet"
import {Tile} from "../types/Tile"

export default class WorldLoader {

  private world: World
  private sets: TileSetLoader[] = []

  private readonly _spawns!: LayerLoader
  private readonly _powers!: LayerLoader
  private readonly _floor!: LayerLoader
  private readonly _walls!: LayerLoader

  public spawns = (): LayerLoader => this._spawns
  public powers = (): LayerLoader => this._powers
  public floor = (): LayerLoader => this._floor
  public walls = (): LayerLoader => this._walls

  constructor(name: string) {
    this.world = this.load(name)
    for (const set of this.world.tilesets) {
      this.sets.push(new TileSetLoader(set.source, set.firstgid))
    }
    for (const layer of this.world.layers) {
      switch (layer.name) {
        case "walls":
          this._walls = new LayerLoader(layer, this.sets)
          break
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

  allTiles = () => this.walls().tiles().slice(0).concat(this.floor().tiles()).concat()

  load(name: string): World {
    switch (name) {
      case "world1":
      default:
        return this.loadJsonMap("world1.json")
    }
  }

  loadJsonMap = (name: string): World => JSON.parse(fs.readFileSync(path.resolve(__dirname, "../map/", name)).toString("utf-8"))

  randomSpawn = (): Tile | undefined => {
    const spawns = this.floor().tiles().filter(t => t !== undefined)
    console.log("spawns", spawns)
    return spawns[Math.round(Math.random() * spawns.length) - 1] || undefined
  }


  clearPowerUps = () => {
    for (const tile of this.powers().tiles()) {
      tile.power_up = undefined
    }
    console.log("Cleared power-ups")
  }
}

class TileSetLoader {

  private _name: string
  private _first_id: number
  private _set: TileSet
  private _tiles: TileSetItem[] = []

  constructor(name: string, index: number) {
    this._first_id = index
    this._set = this.loadJsonTileSet(name)
    this._name = path.basename(name)

    for (let c = 0; c < Math.round(this._set.imagewidth / this._set.tilewidth); c++) {
      for (let r = 0; r < Math.round(this._set.imageheight / this._set.tileheight); r++) {
        const id = index + (c + r)
        this._tiles.push({
          id: id,
          width: this._set.tilewidth,
          height: this._set.tileheight,
          type: this._set.type,
          version: this._set.version,
          tiledversion: this._set.tiledversion
        })
      }
    }
  }

  public firstId = () => this._first_id

  loadJsonTileSet = (name: string): TileSet => JSON.parse(fs.readFileSync(path.resolve(__dirname, "../map/", name)).toString("utf-8"))

  getTileById = (id: number) => this._tiles.find(t => t.id === id)

}

class LayerLoader {

  private _tiles: Tile[] = []

  public tiles = (): Tile[] => this._tiles

  constructor(layer: WorldLayer, sets: TileSetLoader[]) {
    let c = 0
    for (let x = 0; x < layer.width; x++) {
      for (let y = 0; y < layer.height; y++) {
        const index = x * y
        const id = layer.data[c]
        const item = sets.find(s => id >= s.firstId() && s.getTileById(id))?.getTileById(id)
        if (item) {
          console.log(id, index, c, layer.name)
          this._tiles.push(new Tile(
            id,
            x * item.width,
            y * item.height,
            item.type,
            item.version,
            item.tiledversion,
            item.width,
            item.height,
            layer.name,
          ))
        }
        c++
      }
    }
  }
}