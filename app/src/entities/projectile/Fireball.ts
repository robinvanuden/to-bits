import ItemProjectile from "../ItemProjectile"
import Player, {PLAYER_MAX_HEALTH} from "../entity/Player"
import {GRAVITY} from "../../constants"
import Projectile from "../Projectile"
import Bomb from "../entity/Bomb"
import MapTile from "../../world/MapTile"

export const FIREBALL_SIZE = 8
export const FIREBALL_SPEED = 6
export const FIREBALL_GRAVITY = GRAVITY * .2
export const FIREBALL_DAMAGE = PLAYER_MAX_HEALTH * .4

export default class Fireball extends ItemProjectile {

	constructor(player: Player) {
		super(player, FIREBALL_SIZE, FIREBALL_SIZE, FIREBALL_GRAVITY, FIREBALL_DAMAGE, FIREBALL_SPEED)
	}

	public loopPlayer(player: Player): void {
		super.loopPlayer(player)
		if (this.hasLeftPlayer && this.collidesWith(player)) {
			player.damage(this.damage)
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