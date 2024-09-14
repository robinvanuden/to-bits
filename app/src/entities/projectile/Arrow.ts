import ItemProjectile from "../ItemProjectile"
import Player from "../entity/Player"
import {GRAVITY} from "../../constants"
import Projectile from "../Projectile"
import MapTile from "../../world/MapTile"
import Bomb from "../entity/Bomb"
import {DamageCause} from "../entity/Damage"

export const ARROW_WIDTH = 14
export const ARROW_HEIGHT = 5
export const ARROW_SPEED = 4
export const ARROW_GRAVITY = GRAVITY * .2
export const ARROW_DAMAGE = 65

export default class Arrow extends ItemProjectile {

	constructor(player: Player) {
		super(player, ARROW_WIDTH, ARROW_HEIGHT, ARROW_GRAVITY, ARROW_DAMAGE, ARROW_SPEED)
	}

	public loopPlayer(player: Player): void {
		super.loopPlayer(player)
		if (!this.hasLeftPlayer) {
			return
		}
		if (this.collidesWith(player)) {
			player.damage(this.damage, DamageCause.ITEM, {projectile: this})
			this.remove()
			return
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