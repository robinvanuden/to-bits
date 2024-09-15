import ItemProjectile from "../ItemProjectile"
import Player from "../entity/Player"
import {GRAVITY} from "../../constants"
import {DamageCause} from "../entity/Damage"

export const BOOMERANG_SIZE = 8
export const BOOMERANG_SPEED = 10
export const BOOMERANG_GRAVITY = GRAVITY * .2
export const BOOMERANG_DAMAGE = 40

export default class Boomerang extends ItemProjectile {

	dx: number = 0
	dy: number = 0

	timeReturn: number = 350

	constructor(player: Player) {
		super(player, BOOMERANG_SIZE, BOOMERANG_SIZE, BOOMERANG_GRAVITY, BOOMERANG_DAMAGE, BOOMERANG_SPEED * .5)
	}

	public shouldReturn = () => this.hasLifetime(this.timeReturn)

	public retrieve = () => {
		this.timeReturn = this.getNow() - this.timeSpawned
	}

	public loopGravity = (delta: number) => {
		if (this.shouldReturn()) {
			this.x += this.dx * this.speed
			this.y += this.dy * this.speed
		} else {
			super.loopGravity(delta)
		}
	}

	public loopPlayer(player: Player): void {
		super.loopPlayer(player)
		if (this.hasLifetime(this.timeReturn) && this.isOwner(player)) {
			const dx = player.x - this.x
			const dy = player.y - this.y

			// Calculate the distance between this and player
			const distance = Math.sqrt(dx * dx + dy * dy)

			// Normalize the direction
			this.dx = dx / distance
			this.dy = dy / distance
		}
		if (this.hasLeftPlayer && this.isOwner(player) && this.collidesWith(player)) {
			this.remove()
			return
		}
		if (!this.isOwner(player) && this.collidesWith(player)) {
			player.damage(this.damage, DamageCause.ITEM, {projectile: this})
			this.remove()
			return
		}
	}

}