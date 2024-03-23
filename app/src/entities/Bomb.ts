import Entity from "./Entity"
import Player from "./Player"
import {BOMB_EXPLOSION_SIZE, BOMB_GRAVITY, BOMB_SIZE} from "../constants"
import {ExplosionModel} from "../types/EntityModel"

export default class Bomb extends Entity {

	public hasExploded: boolean = false
	public timeExploded: number = 0

	ew: number = 0 // width explosion
	eh: number = 0 // height explosion

	ex = () => this.x - Math.round((this.ew - this.width) * .5)
	ey = () => this.y - Math.round((this.eh - this.height))


	constructor(player: Player) {
		super(player, BOMB_SIZE, BOMB_SIZE, BOMB_GRAVITY)

		this.timeRemove = 5000
		this.timeExploded = 4500
		this.vx = this.vy = 0
		this.ew = this.eh = 0
	}

	private isExplosionHit = (p: Player): boolean =>
		this.hasExploded &&
		this.ex() < p.x + p.width &&
		this.ex() + this.ew > p.x &&
		this.ey() < p.y + p.height
		&& this.ey() + this.eh > p.y

	public isInOtherExplosion = (other: Entity): boolean =>
		other instanceof Bomb &&
		!this.equals(other) &&
		other.hasExploded &&
		other.ex() < this.x + this.width &&
		other.ex() + other.ew > this.x &&
		other.ey() < this.y + this.height
		&& other.ey() + other.eh > this.y

	public explode = () => {
		if (this.hasExploded) {
			return
		}
		console.log("Explode!")
		this.hasExploded = true
		this.ew = BOMB_EXPLOSION_SIZE
		this.eh = Math.round(BOMB_EXPLOSION_SIZE * .75)
		const new_start = Math.round(Date.now() - this.spawned)
		this.timeExploded = new_start
		this.timeRemove = new_start + 500
	}

	public hits = (entity: Entity) => {
		if (this.isInOtherExplosion(entity)) {
			this.explode()
			return true
		}
		return this.isCollidingWithEntity(entity)
	}

	public remove = (player: Player): boolean => {
		if (this.hasLifetime(this.timeExploded) && !this.hasLifetime(this.timeRemove)) {
			this.explode()
			return false
		}
		if (!this.isOwner(player) && this.isHit(player)) {
			this.explode()
			return false
		}
		return this.hasLifetime(this.timeRemove)
	}

	public kills = (player: Player) => {
		if (this.hasExploded && this.isExplosionHit(player)) {
			return true
		}
		if (!this.isOwner(player) && this.isHit(player)) {
			this.explode()
			return true
		}
		return false
	}

	public getExplosion = (): ExplosionModel | undefined => (!this.hasExploded ? undefined : {
		x: this.ex(),
		y: this.ey(),
		w: this.ew,
		h: this.eh
	})
}

