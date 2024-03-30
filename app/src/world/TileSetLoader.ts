import TileSet, {Tile} from "../types/TileSet"
import path from "path"
import fs from "fs"

export default class TileSetLoader {

	private readonly _name: string
	private readonly _first_id: number
	private _set: TileSet
	private _tiles: Tile[] = []

	public name = () => this._name

	public source = () => this._set.image

	public firstId = () => this._first_id

	private loadJsonTileSet = (name: string): TileSet => JSON.parse(fs.readFileSync(path.resolve(__dirname, "../map/", name)).toString("utf-8"))

	public getTileById = (id: number) => this._tiles.find(t => t.tile_id === id)

	constructor(name: string, index: number) {
		this._name = name
		this._first_id = index
		this._set = this.loadJsonTileSet(name)
		let id = 0
		for (let r = 0; r < Math.round(this._set.imageheight / this._set.tileheight); r++) {
			for (let c = 0; c < Math.round(this._set.imagewidth / this._set.tilewidth); c++) {
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
}