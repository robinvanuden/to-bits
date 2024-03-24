import Projectile from "./Projectile"
import Player from "./Player"
import {BOOMERANG_GRAVITY, BOOMERANG_SIZE, BOOMERANG_SPEED} from "../constants"
import Entity from "./Entity"

export default class Boomerang extends Projectile {


	constructor(player: Player, degrees: number) {
		super(player, BOOMERANG_SIZE, BOOMERANG_SIZE, BOOMERANG_GRAVITY, degrees, BOOMERANG_SPEED)
	}

	public interacts = (player: Player): void => {
		if (!this.hasLifetime(250)) {
			return
		}
		if (this.isOwner(player) && this.isHit(player)) {
			return
		}
		if (!this.isOwner(player) && this.isHit(player)) {
			player.kill()
			return
		}
	}

	public hits = (entity: Entity): boolean => {
		return this.isCollidingWithEntity(entity)
	}

}