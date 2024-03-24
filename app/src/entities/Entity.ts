import Player from "./Player"
import MapTile from "./MapTile"
import {v4} from "uuid"
import EntityModel from "../types/EntityModel"
import {ExplosionModel} from "../../public/js/model/EntityModel"

export default abstract class Entity {
	protected readonly id: string = ""
	protected readonly player_id: string = ""

	public readonly width: number // width
	public readonly height: number // height

	x: number = 0 // x-coord
	y: number = 0 // y-coord

	vx: number = 0 // x velocity
	vy: number = 0 // y velocity

	public readonly gravity: number = 0
	public readonly spawned: number = 0
	public timeRemove: number = 20000

	protected constructor(player: Player, width: number, height: number, gravity: number) {
		this.id = v4()
		this.player_id = player.id
		this.width = width
		this.height = height
		this.gravity = gravity
		this.x = player.x + player.width * .5
		this.y = player.y + player.height * .5
		this.spawned = Date.now()
	}

	public equals = (entity: Entity): boolean => this.id === entity.id

	protected isHit = (p: Player): boolean =>
		this.x < p.x + p.width &&
		this.x + this.width > p.x &&
		this.y < p.y + p.height
		&& this.y + this.height > p.y

	public isColliding = (tile: MapTile): boolean =>
		tile.x < this.x + this.width &&
		tile.x + tile.width > this.x &&
		tile.y < this.y + this.height &&
		tile.y + tile.height > this.y

	public isCollidingWithEntity = (entity: Entity): boolean =>
		entity.x < this.x + this.width &&
		entity.x + entity.width > this.x &&
		entity.y < this.y + this.height &&
		entity.y + entity.height > this.y

	public isWalkingOn = (tile: MapTile): boolean =>
		tile.x < this.x + this.width &&
		tile.x + tile.width > this.x &&
		tile.y < this.y + this.height &&
		tile.y + 1 > this.y

	protected isOwner = (p: Player) => this.player_id === p.id

	protected hasLifetime = (milliseconds: number) => (Date.now() - this.spawned) >= milliseconds

	// public kills = (player: Player): boolean => !this.isOwner(player) && this.isHit(player)

	public abstract interacts(player: Player): void

	public abstract hits(entity: Entity): void

	public remove() {
		this.timeRemove = -1000
	}

	public shouldRemove = (player: Player): boolean => {
		if (this.hasLifetime(250)) {
			return false
		}
		if (this.hasLifetime(this.timeRemove)) {
			return true
		}
		return player.died !== undefined
	}

	public isOverdue = () => this.hasLifetime(this.timeRemove)

	static toModel = (entity: Entity, e: ExplosionModel | undefined = undefined): EntityModel => ({
		id: entity.id,
		p: entity.player_id,
		s: entity.spawned,
		t: String(entity.constructor.name).toUpperCase(),
		x: entity.x,
		y: entity.y,
		w: entity.width,
		h: entity.height,
		vx: entity.vx,
		vy: entity.vy,
		e: e
	})
}

