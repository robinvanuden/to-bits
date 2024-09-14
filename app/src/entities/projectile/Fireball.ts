import ItemProjectile from "../ItemProjectile"
import Player from "../entity/Player"
import {GRAVITY} from "../../constants"
import Projectile from "../Projectile"
import Bomb from "../entity/Bomb"
import MapTile from "../../world/MapTile"
import {DamageCause} from "../entity/Damage"

export const FIREBALL_SIZE = 14
export const FIREBALL_SPEED = 7.5
export const FIREBALL_GRAVITY = GRAVITY * .1
export const FIREBALL_DAMAGE = 50

export default class Fireball extends ItemProjectile {

	constructor(player: Player) {
		super(player, FIREBALL_SIZE, FIREBALL_SIZE, FIREBALL_GRAVITY, FIREBALL_DAMAGE, FIREBALL_SPEED)
	}

	public loopPlayer(player: Player): void {
		super.loopPlayer(player)
		if (this.hasLeftPlayer && this.collidesWith(player)) {
			player.damage(this.damage, DamageCause.ITEM, {projectile: this})
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