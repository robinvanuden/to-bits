import Projectile from "./Projectile"
import Player from "./Player"
import {GRAVITY} from "../constants"
import Entity from "./Entity"
import MapTile from "../world/MapTile"
import Bomb from "./Bomb"

export const ARROW_WIDTH = 10
export const ARROW_HEIGHT = 2
export const ARROW_SPEED = 4
export const ARROW_GRAVITY = GRAVITY * .2

export default class Arrow extends Projectile {

	constructor(player: Player, degrees: number) {
		super(player, ARROW_WIDTH, ARROW_HEIGHT, ARROW_GRAVITY, degrees, ARROW_SPEED)
	}

	public loop = () => {
	}

	public loopPlayer = (player: Player): void => {
		if (!this.isThrown()) {
			return
		}
		if (this.isHit(player)) {
			player.kill()
			this.remove()
			return
		}
	}

	public loopEntity = (entity: Entity): void => {
		if (!this.isCollidingWithEntity(entity)) {
			return
		}
		this.remove()
		if (entity instanceof Bomb) {
			console.log("Touched bomb")
			entity.explode()
		} else {
			console.log("Touched")
			entity.remove()
		}
	}

	public loopTile = (tile: MapTile): void => {
		if (tile.isSolid() && this.isColliding(tile)) {
			console.log("Collided")
			this.remove()
		}
	}

}