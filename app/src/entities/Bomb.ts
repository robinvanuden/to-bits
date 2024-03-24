import Entity from "./Entity"
import Player from "./Player"
import {BOMB_EXPLOSION_SIZE, BOMB_GRAVITY, BOMB_SIZE} from "../constants"
import {ExplosionModel} from "../types/EntityModel"
import Projectile from "./Projectile"
import MapTile from "./MapTile"

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
		const new_start = Math.round(Date.now() - this.spawned)
		this.timeExploded = new_start
		this.timeRemove = new_start + 500
	}

	public loop = (): void => {
		if (this.hasLifetime(this.timeExploded) && !this.hasLifetime(this.timeRemove)) {
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
		if (other instanceof Bomb && !this.equals(other) && this.isInOtherExplosion(other)) {
			this.explode()
			return
		}
		if (other instanceof Projectile && this.isCollidingWithEntity(other)) {
			this.explode()
			other.remove()
		}
	}

	public loopTile = (tile: MapTile): void => {
	}

	public getExplosion = (): ExplosionModel | undefined => (!this.hasExploded ? undefined : {
		x: this.ex(),
		y: this.ey(),
		w: this.ew,
		h: this.eh
	})
}

