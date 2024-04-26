import MapTile from "./MapTile"
import TiledWorld, {TiledWorldLayer} from "../types/TiledWorld"
import TileSetLoader from "./TileSetLoader"
import {TileLayerModel} from "../types/model/MapTileModel"

export default class LayerLoader {

	private _map_tiles: MapTile[] = []
	private readonly _layer: TiledWorldLayer

	public tiles = (): MapTile[] => this._map_tiles || []

	public layer = () => this._layer

	public name = () => this._layer.name

	public solids = (): MapTile[] => this.tiles().filter(t => !t.isSemiSolid())

	public semis = (): MapTile[] => this.tiles().filter(t => t.isSemiSolid())

	constructor(world: TiledWorld, layer: TiledWorldLayer, sets: TileSetLoader[], seed: string) {
		this._layer = layer
		let c = 0
		for (let y = 0; y < world.height; y++) {
			for (let x = 0; x < world.width; x++) {
				const tile_x = x * world.tilewidth
				const tile_y = y * world.tileheight
				const id = layer.data[c]
				if (id) {
					const item = sets.find(s => id >= s.firstId() && s.getTileById(id))?.getTileById(id)
					if (item) {
						this._map_tiles.push(new MapTile(id, tile_x, tile_y, seed, layer, item))
					}
				}
				c++
			}
		}
		console.log("Loaded layer:", layer.name, this._map_tiles.length)
	}

	public toModel = (): TileLayerModel => ({
		n: this.name(),
		ls: this.tiles().map(t => t.toModel())
	})
}