import ItemProjectile from "../ItemProjectile"
import Player from "../entity/Player"
import {GRAVITY} from "../../constants"
import Projectile from "../Projectile"
import Bomb from "../entity/Bomb"
import MapTile from "../../world/MapTile"

export const FIREBALL_SIZE = 8
export const FIREBALL_SPEED = 6
export const FIREBALL_GRAVITY = GRAVITY * .2

export default class Fireball extends ItemProjectile {

	constructor(player: Player, degrees: number) {
		super(player, FIREBALL_SIZE, FIREBALL_SIZE, FIREBALL_GRAVITY, degrees, FIREBALL_SPEED)
	}

	public loop = (): void => {
	}

	public loopPlayer = (player: Player): void => {
		if (!this.isOwner(player) && this.collidesWith(player)) {
			player.kill()
			this.remove()
		}
	}

	public loopEntity = (entity: Projectile): void => {
		if (!this.collidesWith(entity)) {
			return
		}
		this.remove()
		if (entity instanceof Bomb) {
			entity.explode()
		} else {
			entity.remove()
		}
	}

	public loopTile = (tile: MapTile): void => {
		if (tile.isSolid() && this.collidesWith(tile)) {
			this.remove()
		}
	}
}