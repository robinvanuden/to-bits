import ItemProjectile from "../ItemProjectile"
import Player from "../entity/Player"
import {GRAVITY} from "../../constants"
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

}