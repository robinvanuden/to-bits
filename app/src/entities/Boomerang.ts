import Projectile from "./Projectile"
import Player from "./Player"
import {GRAVITY} from "../constants"
import Entity from "./Entity"
import MapTile from "../world/MapTile"
import Bomb from "./Bomb"
import Fireball from "./Fireball"

export const BOOMERANG_SIZE = 8
export const BOOMERANG_SPEED = 10
export const BOOMERANG_GRAVITY = GRAVITY * .2

export default class Boomerang extends Projectile {

	dx: number = 0
	dy: number = 0
	timeReturn: number = 350

	constructor(player: Player, degrees: number) {
		super(player, BOOMERANG_SIZE, BOOMERANG_SIZE, BOOMERANG_GRAVITY, degrees, BOOMERANG_SPEED * .5)
	}

	public shouldReturn = () => this.hasLifetime(this.timeReturn)

	public loop = () => {

	}

	public loopPlayer = (player: Player): void => {
		if (this.hasLifetime(this.timeReturn) && this.isOwner(player)) {
			const dx = player.x - this.x
			const dy = player.y - this.y

			// Calculate the distance between this and player
			const distance = Math.sqrt(dx * dx + dy * dy)

			// Normalize the direction
			this.dx = dx / distance
			this.dy = dy / distance
		}
		if (this.isThrown() && this.isOwner(player) && this.isHit(player)) {
			console.log("Caught")
			this.remove()
			return
		}
		if (!this.isOwner(player) && this.isHit(player)) {
			console.log("Killed")
			player.kill()
			this.remove()
			return
		}
	}

	public loopEntity = (entity: Entity): void => {
		if (!this.isCollidingWithEntity(entity)) {
			return
		}
		if (entity instanceof Bomb) {
			return
		}
		if (entity instanceof Fireball) {
			this.remove()
		} else {
			entity.remove()
		}
	}

	public loopTile = (tile: MapTile): void => {
		if (tile.isSolid() && this.isColliding(tile)) {
			console.log("Collided")
			this.timeReturn = Date.now() - this.timeSpawned
		}
	}

}