import ItemProjectile from "../ItemProjectile"
import Player from "../entity/Player"
import {GRAVITY} from "../../constants"
import Projectile from "../Projectile"
import MapTile from "../../world/MapTile"
import Bomb from "../entity/Bomb"
import Fireball from "./Fireball"

export const BOOMERANG_SIZE = 8
export const BOOMERANG_SPEED = 10
export const BOOMERANG_GRAVITY = GRAVITY * .2

export default class Boomerang extends ItemProjectile {

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
		if (this.isThrown() && this.isOwner(player) && this.collidesWith(player)) {
			this.remove()
			return
		}
		if (!this.isOwner(player) && this.collidesWith(player)) {
			player.kill()
			this.remove()
			return
		}
	}

	public loopEntity = (entity: Projectile): void => {
		if (!this.collidesWith(entity)) {
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
		if (tile.isSolid() && this.collidesWith(tile)) {
			this.timeReturn = Date.now() - this.timeSpawned
		}
	}

}