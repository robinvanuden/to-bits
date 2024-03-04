import World, {WorldLayer} from "../types/World"
import * as path from "path"
import * as fs from "fs"
import TileSet, {Tile, TileSetItem} from "../types/TileSet"

export default class WorldLoader {

  private world: World
  private sets: TileSetLoader[] = []

  private readonly spawns!: LayerLoader
  private readonly powers!: LayerLoader
  private readonly floor!: LayerLoader
  private readonly walls!: LayerLoader

  public getSpawns = (): LayerLoader => this.spawns
  public getPowers = (): LayerLoader => this.powers
  public getFloor = (): LayerLoader => this.floor
  public getWalls = (): LayerLoader => this.walls

  constructor(name: string) {
    this.world = this.load(name)
    for (const set of this.world.tilesets) {
      this.sets.push(new TileSetLoader(set.source, set.firstgid))
    }
    for (const layer of this.world.layers) {
      switch (layer.name) {
        case "walls":
          this.walls = new LayerLoader(layer, this.sets)
          break
        case "floor":
          this.floor = new LayerLoader(layer, this.sets)
          break
        case "powers":
          this.powers = new LayerLoader(layer, this.sets)
          break
        case "spawns":
          this.spawns = new LayerLoader(layer, this.sets)
          break
      }
    }
  }

  load(name: string): World {
    switch (name) {
      case "world1":
      default:
        return this.loadJsonMap("world1.json")
    }
  }

  loadJsonMap = (name: string): World => JSON.parse(fs.readFileSync(path.resolve(__dirname, "../map/", name)).toString("utf-8"))

  randomSpawn = () => {
    const spawns = this.spawns.getTiles()
    return spawns[Math.round(Math.random() * spawns.length) - 1]
  }
}

class TileSetLoader {

  private name: string
  private set: TileSet
  private tiles: TileSetItem[] = []

  public getTiles = (): TileSetItem[] => this.tiles

  constructor(name: string, index: number) {
    this.set = this.loadJsonTileSet(name)
    this.name = path.basename(name)

    for (let c = 0; c < Math.round(this.set.imagewidth / this.set.tilewidth); c++) {
      for (let r = 0; r < Math.round(this.set.imageheight / this.set.tileheight); r++) {
        this.tiles.push({
          id: index + (c + r),
          width: this.set.tilewidth,
          height: this.set.tileheight,
          type: this.set.type,
          version: this.set.version,
          tiledversion: this.set.tiledversion
        })
      }
    }
  }

  loadJsonTileSet = (name: string): TileSet => JSON.parse(fs.readFileSync(path.resolve(__dirname, "../map/", name)).toString("utf-8"))

  getTileById = (id: number) => this.tiles.find(t => t.id === id)

}

class LayerLoader {

  private tiles: Tile[] = []
  private sets: TileSetLoader[] = []

  public getTiles = (): Tile[] => this.tiles

  constructor(layer: WorldLayer, sets: TileSetLoader[]) {
    this.sets = sets
    for (let x = 0; x < layer.width; x++) {
      for (let y = 0; y < layer.height; y++) {
        const index = x + y
        const id = layer.data[index]
        const item = this.findTileById(id)
        if (item) {
          this.tiles.push({
            id: id,
            x: x * item.width,
            y: y * item.height,
            layer: layer.name,
            width: item.width,
            height: item.height,
            type: item.type,
            version: item.version,
            tiledversion: item.tiledversion,
            power_up: undefined
          })
        }
      }
    }
  }

  findTileById = (id: number) => this.sets.find(s => s.getTileById(id))?.getTileById(id)
}