import TiledWorld from "../types/TiledWorld"
import * as path from "path"
import * as fs from "fs"
import MapTile from "./MapTile"
import Player from "../entities/entity/Player"
import TileSetLoader from "./TileSetLoader"
import LayerLoader from "./LayerLoader"
import {v4} from "uuid"
import Projectile from "../entities/Projectile"

export default class WorldLoader {

	private readonly isDev: boolean
	private readonly world: TiledWorld
	private sets: TileSetLoader[] = []

	private readonly _seed!: string
	private readonly _spawns!: LayerLoader
	private readonly _items!: LayerLoader
	private readonly _terrain!: LayerLoader
	private readonly _danger!: LayerLoader
	private readonly _decor!: LayerLoader

	public seed = () => this._seed
	public spawns = () => this._spawns
	public items = () => this._items
	public terrain = () => this._terrain
	public danger = () => this._danger
	public decor = () => this._decor

	constructor(name: string) {
		this.isDev = (process.env?.NODE_ENV || "development") === "development"
		this._seed = v4()
		this.world = this.loadJsonMap(name + ".json")
		for (const set of this.world.tilesets) {
			this.sets.push(new TileSetLoader(set.source, set.firstgid))
		}
		for (const layer of this.world.layers) {
			switch (layer.name) {
			case "decor":
				this._decor = new LayerLoader(this.world, layer, this.sets, this.seed())
				break
			case "danger":
				this._danger = new LayerLoader(this.world, layer, this.sets, this.seed())
				break
			case "terrain":
				this._terrain = new LayerLoader(this.world, layer, this.sets, this.seed())
				break
			case "items":
				this._items = new LayerLoader(this.world, layer, this.sets, this.seed())
				break
			case "spawns":
				this._spawns = new LayerLoader(this.world, layer, this.sets, this.seed())
				break
			}
		}
	}

	tileSources = () => this.sets.map(s => "/texture/set/" + path.basename(s.source()))

	loadJsonMap = (name: string): TiledWorld => JSON.parse(fs.readFileSync(path.resolve(__dirname, "../map/", name)).toString("utf-8"))

	pickRandomSpawnPoint = (): MapTile | undefined => {
		const spawns = this.spawns().tiles().filter(t => t !== undefined)
		const picked = Math.ceil(Math.random() * spawns.length) - 1
		return spawns[picked] || spawns[0] || undefined
	}

	public spawnPowerUp = () => {
		if (!this.isDev && Math.round(Math.random() * 500) !== 1) {
			return
		}
		const airs = this.items().tiles()
		const index = Math.round(Math.random() * (airs.length - 1))
		const tile: MapTile | undefined = airs[index] || undefined
		if (!tile) {
			return
		}
		tile.spawnPower()
	}

	clearPowerUps = () => {
		for (const tile of this.items().tiles()) {
			tile.power_up = undefined
		}
		console.log("Cleared power-ups")
	}

	isPlayerInVoid = (player: Player): boolean => (player.y + player.height) > (this.world.height * this.world.tileheight)

	isEntityInVoid = (entity: Projectile): boolean => (entity.y + entity.height) > (this.world.height * this.world.tileheight)
}

let world1: WorldLoader | undefined = undefined

export const useWorld1 = () => world1 ? world1 : (world1 = new WorldLoader("world1"))
