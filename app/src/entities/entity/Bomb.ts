import Projectile from "../Projectile"
import Player from "./Player"
import {GRAVITY} from "../../constants"
import {ExplosionModel} from "../../types/model/ProjectileModel"
import Entity from "../Entity"
import Explosion from "./Explosion"
import {DamageCause} from "./Damage"

export const BOMB_EXPLOSION_SIZE = 48
export const BOMB_DAMAGE = 100
export const BOMB_GRAVITY = GRAVITY

export default class Bomb extends Projectile {

	public timeExploded: number = 0
	private explosion: Entity | undefined = undefined

	constructor(player: Player) {
		super(player, 11, 12, BOMB_GRAVITY, BOMB_DAMAGE)

		this.timeExploded = 2000
		this.timeRemove = 2500
		this.vx = this.vy = 0
		this.explosion = undefined
	}

	public isExplosionHit = (p: Player): boolean => this.explosion?.collidesWith(p) || false

	public isInOtherExplosion = (other: Bomb): boolean => other.explosion?.collidesWith(this) || false

	public explode = () => {
		if (this.explosion) {
			return
		}
		this.explosion = new Explosion(
			this.x - Math.round((BOMB_EXPLOSION_SIZE - this.width) * .5),
			this.y - Math.round((BOMB_EXPLOSION_SIZE - this.height)),
			BOMB_EXPLOSION_SIZE,
			BOMB_EXPLOSION_SIZE
		)
		this.vx = this.vy = this.gravity = 0
		const new_start = Math.round(this.getNow() - this.timeSpawned)
		this.timeExploded = new_start
		this.timeRemove = new_start + 500
	}

	public loop = (): void => {
		if (this.hasLifetime(this.timeExploded)) {
			this.explode()
		}
	}

	public loopPlayer = (player: Player): void => {
		if (this.explosion && this.isExplosionHit(player)) {
			player.damage(this.damage, DamageCause.ITEM, {projectile: this})
		} else if (!this.isOwner(player) && this.collidesWith(player)) {
			player.damage(this.damage, DamageCause.ITEM, {projectile: this})
			this.explode()
		}
	}

	public getExplosion = (): ExplosionModel | undefined => (this.explosion ? {
		x: this.explosion.x,
		y: this.explosion.y,
		w: this.explosion.width,
		h: this.explosion.height
	} : undefined)
}

