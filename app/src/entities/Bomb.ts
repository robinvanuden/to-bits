import Entity from "./Entity"
import Player from "./Player"
import {GRAVITY} from "../constants"
import {ExplosionModel} from "../types/EntityModel"
import MapTile from "../world/MapTile"
import Fireball from "./Fireball"
import Arrow from "./Arrow"

export const BOMB_EXPLOSION_SIZE = 48
export const BOMB_GRAVITY = GRAVITY

export default class Bomb extends Entity {

	public hasExploded: boolean = false
	public timeExploded: number = 0

	ew: number = 0 // width explosion
	eh: number = 0 // height explosion

	ex = () => this.x - Math.round((this.ew - this.width) * .5)
	ey = () => this.y - Math.round((this.eh - this.height))


	constructor(player: Player) {
		super(player, 11, 12, BOMB_GRAVITY)

		this.timeRemove = 2500
		this.timeExploded = 2000
		this.vx = this.vy = 0
		this.ew = this.eh = 0
	}

	private isExplosionHit = (p: Player): boolean =>
		this.hasExploded &&
		this.ex() < p.x + p.width &&
		this.ex() + this.ew > p.x &&
		this.ey() < p.y + p.height
		&& this.ey() + this.eh > p.y

	public isInOtherExplosion = (other: Bomb): boolean =>
		other.hasExploded &&
		other.ex() < this.x + this.width &&
		other.ex() + other.ew > this.x &&
		other.ey() < this.y + this.height
		&& other.ey() + other.eh > this.y

	public explode = () => {
		if (this.hasExploded) {
			return
		}
		this.hasExploded = true
		this.ew = BOMB_EXPLOSION_SIZE
		this.eh = Math.round(BOMB_EXPLOSION_SIZE * .75)
		this.vx = this.vy = this.gravity = 0
		const new_start = Math.round(Date.now() - this.timeSpawned)
		this.timeExploded = new_start
		this.timeRemove = new_start + 500
	}

	public loop = (): void => {
		if (this.hasLifetime(this.timeRemove)) {
			this.remove()
			return
		}
		if (this.hasLifetime(this.timeExploded)) {
			this.explode()
		}
	}

	public loopPlayer = (player: Player): void => {
		if (this.hasExploded && this.isExplosionHit(player)) {
			player.kill()
			return
		}
		if (!this.isOwner(player) && this.isHit(player)) {
			player.kill()
			this.explode()
		}
	}

	public loopEntity = (other: Entity): void => {
		if (other instanceof Bomb && this.isInOtherExplosion(other)) {
			this.explode()
			return
		}
		if (!this.isCollidingWithEntity(other)) {
			return
		}
		if (other instanceof Fireball || other instanceof Arrow) {
			this.explode()
			other.remove()
		}
	}

	public loopTile = (tile: MapTile): void => {
		if (!this.isWalkingOn(tile)) {
			return
		}
		if (tile.isSemiSolid() && this.vy > 0) {
			this.y = tile.y - this.height
			this.vx = 0
			this.vy = 0
		}
		if (tile.isSolid() && this.vy > 0) {
			this.y = tile.y - this.height
			this.vx = 0
			this.vy = 0
		}
	}

	public getExplosion = (): ExplosionModel | undefined => (!this.hasExploded ? undefined : {
		x: this.ex(),
		y: this.ey(),
		w: this.ew,
		h: this.eh
	})
}

