import Projectile from "./Projectile"
import Player from "./Player"
import {FIREBALL_GRAVITY, FIREBALL_SIZE, FIREBALL_SPEED} from "../constants"
import Entity from "./Entity"
import Bomb from "./Bomb"

export default class Fireball extends Projectile {


	constructor(player: Player, degrees: number) {
		super(player, FIREBALL_SIZE, FIREBALL_SIZE, FIREBALL_GRAVITY, degrees, FIREBALL_SPEED)
	}

	public interacts = (player: Player): void => {
		if (!this.isOwner(player) && this.isHit(player)) {
			player.kill()
			this.remove()
		}
	}

	public hits = (entity: Entity): void => {
		if (!this.hasLifetime(250) || !this.isCollidingWithEntity(entity)) {
			return
		}
		this.remove()
		if (entity instanceof Bomb) {
			entity.explode()
			return
		}
		entity.remove()
	}
}