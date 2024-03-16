import MapTile from "../entities/MapTile"
import {WorldLayer} from "../types/World"
import TileSetLoader from "./TileSetLoader"
import {TileLayerModel} from "../types/MapTileModel"

export default class LayerLoader {

  private _map_tiles: MapTile[] = []
  private readonly _layer: WorldLayer

  public tiles = (): MapTile[] => this._map_tiles || []

  public name = () => this._layer.name

  public solids = (): MapTile[] => this.tiles().filter(t => !t.isSemiSolid())

  public semis = (): MapTile[] => this.tiles().filter(t => t.isSemiSolid())

  constructor(layer: WorldLayer, sets: TileSetLoader[]) {
    this._layer = layer
    let c = 0
    for (let y = 0; y < layer.height; y++) {
      for (let x = 0; x < layer.width; x++) {
        const id = layer.data[c]
        const item = sets.find(s => id >= s.firstId() && s.getTileById(id))?.getTileById(id)
        if (item) this._map_tiles.push(new MapTile(id, x, y, layer, item))
        c++
      }
    }
    console.log("Loaded layer:", layer.name, this._map_tiles.length)
  }

  public toModel = (): TileLayerModel => ({
    n: this.name(),
    ls: this.tiles().map(MapTile.toModel)
  })
}