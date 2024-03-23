import Projectile from "./Projectile"
import Player from "./Player"
import {FIREBALL_GRAVITY, FIREBALL_SIZE, FIREBALL_SPEED} from "../constants"
import Entity from "./Entity"

export default class Fireball extends Projectile {


	constructor(player: Player, degrees: number) {
		super(player, FIREBALL_SIZE, FIREBALL_SIZE, FIREBALL_GRAVITY, degrees, FIREBALL_SPEED)
	}

	public remove = (player: Player): boolean => {
		if (!this.isOwner(player) && this.isHit(player)) {
			return true
		}
		return this.shouldRemove(player)
	}

	public hits = (entity: Entity): boolean => {
		return this.isCollidingWithEntity(entity)
	}
}