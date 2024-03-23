import Entity from "./Entity"
import Player from "./Player"

export default abstract class Projectile extends Entity {

	protected constructor(player: Player, width: number, height: number, gravity: number, degrees: number, speed: number) {
		super(player, width, height, gravity)
		const radians = (degrees * Math.PI) / 180

		this.vx = speed * Math.cos(radians)
		this.vy = speed * Math.sin(radians)
	}
}