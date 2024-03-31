import Projectile from "./Projectile"
import Player from "./entity/Player"

export default abstract class ItemProjectile extends Projectile {

	public speed: number

	public isThrown = () => this.hasLifetime(250)

	protected constructor(player: Player, width: number, height: number, gravity: number, degrees: number, speed: number) {
		super(player, width, height, gravity)
		const radians = (degrees * Math.PI) / 180

		this.speed = speed
		this.vx = speed * Math.cos(radians)
		this.vy = speed * Math.sin(radians)
	}
}