import Projectile from "./Projectile"
import Player from "./Player"
import {BOOMERANG_GRAVITY, BOOMERANG_SIZE, BOOMERANG_SPEED} from "../constants"
import Entity from "./Entity"

export default class Boomerang extends Projectile {


	constructor(player: Player, degrees: number) {
		super(player, BOOMERANG_SIZE, BOOMERANG_SIZE, BOOMERANG_GRAVITY, degrees, BOOMERANG_SPEED)
	}

	public remove = (player: Player): boolean => {
		if (this.hasLifetime(250) && this.isOwner(player) && this.isHit(player)) {
			return true
		}
		return this.shouldRemove(player)
	}

	public hits = (entity: Entity): boolean => {
		return this.isCollidingWithEntity(entity)
	}

}