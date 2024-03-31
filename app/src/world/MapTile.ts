import {PROP_SEMI_SOLID, Tile, TileSetProperty} from "../types/TileSet"
import {WorldLayer} from "../types/World"
import MapTileModel from "../types/MapTileModel"
import path from "path"
import PowerUp from "../entities/PowerUp"
import Entity from "../entities/Entity"

export default class MapTile extends Entity {
	name: string
	seed: string
	source: string
	offset_x: number
	offset_y: number
	type: string
	version: string
	tiledversion: string
	layer: string
	power_up: PowerUp | undefined
	properties: TileSetProperty[]

	constructor(id: number, x: number, y: number, seed: string, layer: WorldLayer, item: Tile) {
		super(x, y, item.tilewidth, item.tileheight, String(id))
		this.seed = seed
		this.name = item.name
		this.source = item.source
		this.offset_x = item.offset_x
		this.offset_y = item.offset_y
		this.type = item.type
		this.version = item.version
		this.tiledversion = item.tiledversion
		this.layer = layer.name
		this.power_up = undefined
		this.properties = item.properties || []
	}

	public hasPowerUp = (): boolean => this.power_up !== undefined

	public isSolid = (): boolean => !this.properties.find(p => p.name === PROP_SEMI_SOLID && p.value)

	public isSemiSolid = (): boolean => this.properties.find(p => p.name === PROP_SEMI_SOLID && p.value) != undefined

	public spawnPower = () => {
		if (!this.hasPowerUp()) this.power_up = PowerUp.random()
	}

	private generateTextureUrl = () => {
		const body = [path.basename(this.source), this.seed]
		const hash = Buffer.from(JSON.stringify(body), "utf-8").toString("base64url")
		return "/texture/set/" + hash + path.extname(this.source)
	}

	public toModel = (): MapTileModel => ({
		x: this.x,
		y: this.y,
		ox: this.offset_x,
		oy: this.offset_y,
		w: this.width,
		h: this.height,
		t: Number(this.id),
		i: this.generateTextureUrl(),
		d: 0,
		sp: this.layer === "spawn",
		wa: this.isSemiSolid(),
		so: !this.isSemiSolid(),
		pu: this.power_up ? PowerUp.toModel(this.power_up) : undefined
	})

}