import Player from "./Player"
import MapTile from "./MapTile"
import PowerUp, {PowerType} from "./PowerUp"
import {v4} from "uuid"
import {
	BOMB_EXPLOSION_SIZE,
	BOMB_GRAVITY,
	BOMB_SIZE,
	BOMB_SPEED,
	BOOMERANG_GRAVITY,
	BOOMERANG_SIZE,
	BOOMERANG_SPEED,
	FIREBALL_GRAVITY,
	FIREBALL_SIZE,
	FIREBALL_SPEED
} from "../constants"
import ProjectileModel from "../types/ProjectileModel"

export default class Entity {
	private readonly id: string = ""
	private readonly player_id: string = ""

	public readonly type: PowerType

	width: number // width
	height: number // height

	x: number = 0 // x-coord
	y: number = 0 // y-coord

	vx: number // x velocity
	vy: number // y velocity

	ew: number // width explosion
	eh: number // height explosion
	ex = () => this.x - Math.round((this.ew - this.width) * .5)
	ey = () => this.y - Math.round((this.eh - this.height))

	public readonly gravity: number = 0
	public readonly spawned: number = 0
	public timeRemove: number = 20000

	public readonly isProjectile: boolean
	public readonly isCatchable: boolean

	public readonly isExplosive: boolean
	public hasExploded: boolean = false
	public timeExploded: number = 0


	private constructor(player: Player, type: PowerType, radians: number) {
		this.id = v4()
		this.player_id = player.id
		this.type = type
		this.x = player.x + player.width * .5
		this.y = player.y + player.height * .5
		this.spawned = Date.now()
		this.ew = this.eh = 0
		switch (type) {
		case PowerType.BOOMERANG:
			this.gravity = BOOMERANG_GRAVITY
			this.isProjectile = true
			this.isExplosive = false
			this.isCatchable = true
			this.width = this.height = BOOMERANG_SIZE
			this.vx = BOOMERANG_SPEED * Math.cos(radians)
			this.vy = BOOMERANG_SPEED * Math.sin(radians)
			break
		case PowerType.BOMB:
			this.gravity = BOMB_GRAVITY
			this.isExplosive = true
			this.isProjectile = false
			this.isCatchable = false
			this.timeRemove = 5000
			this.timeExploded = 4500
			this.width = this.height = BOMB_SIZE
			this.vx = BOMB_SPEED * Math.cos(radians)
			this.vy = BOMB_SPEED * Math.sin(radians)
			break
		case PowerType.FIREBALL:
			this.gravity = FIREBALL_GRAVITY
			this.isExplosive = false
			this.isProjectile = true
			this.isCatchable = false
			this.width = this.height = FIREBALL_SIZE
			this.vx = FIREBALL_SPEED * Math.cos(radians)
			this.vy = FIREBALL_SPEED * Math.sin(radians)
			break
		}
	}

	public static create(player: Player, type: PowerType, degrees: number) {
		const radians = (degrees * Math.PI) / 180
		return new Entity(player, type, radians)
	}

	public equals = (entity: Entity): boolean => this.id === entity.id

	private isHit = (p: Player): boolean =>
		this.x < p.x + p.width &&
		this.x + this.width > p.x &&
		this.y < p.y + p.height
		&& this.y + this.height > p.y

	private isExplosionHit = (p: Player): boolean =>
		this.hasExploded &&
		this.ex() < p.x + p.width &&
		this.ex() + this.ew > p.x &&
		this.ey() < p.y + p.height
		&& this.ey() + this.eh > p.y

	public isInOtherExplosion = (other: Entity): boolean =>
		other.isExplosive &&
		!this.equals(other) &&
		other.hasExploded &&
		other.ex() < this.x + this.width &&
		other.ex() + other.ew > this.x &&
		other.ey() < this.y + this.height
		&& other.ey() + other.eh > this.y

	public isColliding = (tile: MapTile): boolean =>
		tile.x < this.x + this.width &&
		tile.x + tile.width > this.x &&
		tile.y < this.y + this.height &&
		tile.y + tile.height > this.y

	public isWalkingOn = (tile: MapTile): boolean =>
		tile.x < this.x + this.width &&
		tile.x + tile.width > this.x &&
		tile.y < this.y + this.height &&
		tile.y + 1 > this.y

	private isOwner = (p: Player) => this.player_id === p.id

	private hasLifetime = (milliseconds: number) => (Date.now() - this.spawned) >= milliseconds

	public remove = (player: Player): boolean => {
		if (!this.hasLifetime(250)) {
			return false
		}
		if (this.hasLifetime(this.timeRemove)) {
			return true
		}
		if (this.isExplosive && this.hasLifetime(this.timeExploded)) {
			this.explode()
		}
		if (this.isCatchable) {
			return this.isOwner(player) && this.isHit(player)
		} else if (this.isProjectile) {
			return !this.isOwner(player) && this.isHit(player)
		} else {
			return false
		}
	}
	public kills = (player: Player): boolean => {
		if (this.isExplosive) {
			return this.hasExploded && this.isExplosionHit(player)
		} else {
			return !this.isOwner(player) && this.isHit(player)
		}
	}

	public explode = () => {
		if (this.hasExploded) {
			return
		}
		this.hasExploded = true
		this.ew = BOMB_EXPLOSION_SIZE
		this.eh = Math.round(BOMB_EXPLOSION_SIZE * .75)
		const new_start = Math.round(Date.now() - this.spawned)
		this.timeRemove = new_start + 500
		this.timeExploded = new_start
	}

	static toModel = (p: Entity): ProjectileModel => ({
		id: p.id,
		p: p.player_id,
		t: PowerUp.toString(p.type),
		s: p.spawned,
		x: p.x,
		y: p.y,
		w: p.width,
		h: p.height,
		vx: p.vx,
		vy: p.vy,
		ex: p.ex(),
		ey: p.ey(),
		ew: p.ew,
		eh: p.eh,
	})
}

