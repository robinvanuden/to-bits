import Projectile from "./Projectile"
import Player from "./Player"
import {ARROW_GRAVITY, ARROW_HEIGHT, ARROW_SPEED, ARROW_WIDTH} from "../constants"
import Entity from "./Entity"
import MapTile from "../world/MapTile"
import Bomb from "./Bomb"

export default class Arrow extends Projectile {


	constructor(player: Player, degrees: number) {
		super(player, ARROW_WIDTH, ARROW_HEIGHT, ARROW_GRAVITY, degrees, ARROW_SPEED)
	}

	public loop = () => {
	}

	public loopPlayer = (player: Player): void => {
		if (!this.hasLifetime(250)) {
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