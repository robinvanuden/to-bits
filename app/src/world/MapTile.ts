import {TiledTile} from "../types/TiledTileSet"
import MapTileModel from "../types/model/MapTileModel"
import PowerUp from "../entities/PowerUp"
import Entity from "../entities/Entity"
import path from "path"
import {getNow} from "../game"

export default class MapTile extends Entity {
	private readonly _name: string
	private readonly _source: string
	private readonly _offset_x: number
	private readonly _offset_y: number
	public _damage: number
	public power_up: PowerUp | undefined
	public power_up_spawn: number

	constructor(id: number, x: number, y: number, item: TiledTile) {
		super(x, y, item.tilewidth, item.tileheight, String(id))
		this._name = item.name
		this._source = item.source
		this._offset_x = item.offset_x
		this._offset_y = item.offset_y
		this.power_up = undefined
		this.power_up_spawn = -1
		this._damage = 0
		switch (path.basename(item.source)) {
		case "spikes.png":
			this._damage = 33
			break
		case "lava.png":
			this._damage = 55
			break
		}
	}

	public get name() {
		return this._name
	}

	public get damage() {
		return this._damage
	}

	public hasPowerUp = (): boolean => this.power_up !== undefined

	public hasRecentSpawned = (): boolean => this.power_up_spawn + 1000 > getNow()

	public spawnPower = () => {
		if (this.hasPowerUp()) {
			return
		}
		this.power_up = PowerUp.random()
		this.power_up_spawn = getNow()
	}

	private generateTextureUrl = () => "/texture/set/" + path.basename(this._source)

	public toModel = (): MapTileModel => ({
		x: Math.round(this.x),
		y: Math.round(this.y),
		w: this.width,
		h: this.height,
		p: this.power_up ? this.power_up.toModel() : undefined,
		t: {
			i: this.generateTextureUrl(),
			w: this.width,
			h: this.height,
			x: this._offset_x,
			y: this._offset_y,
		}
	})

}