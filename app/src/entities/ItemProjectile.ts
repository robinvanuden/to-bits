import Projectile from "./Projectile"
import Player from "./entity/Player"

export default abstract class ItemProjectile extends Projectile {

	private readonly _speed: number
	private _hasLeftPlayer = false

	get hasLeftPlayer(): boolean {
		return this._hasLeftPlayer
	}

	get speed(): number {
		return this._speed
	}

	protected constructor(
		player: Player,
		width: number,
		height: number,
		gravity: number,
		damage: number,
		speed: number
	) {
		super(player, width, height, gravity, damage)
		const radians = (player.look.r ? 0 : 180 * Math.PI) / 180

		this._speed = speed
		this.vx = speed * Math.cos(radians)
		this.vy = speed * Math.sin(radians)
	}

	public loopPlayer(player: Player): void {
		if (!this._hasLeftPlayer && !this.collidesWith(this.player)) {
			this._hasLeftPlayer = true
		}
	}
}