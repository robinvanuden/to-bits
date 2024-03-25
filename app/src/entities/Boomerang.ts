import Projectile from "./Projectile"
import Player from "./Player"
import {BOOMERANG_GRAVITY, BOOMERANG_SIZE, BOOMERANG_SPEED} from "../constants"
import Entity from "./Entity"
import MapTile from "../world/MapTile"
import Bomb from "./Bomb"

export default class Boomerang extends Projectile {


	constructor(player: Player, degrees: number) {
		super(player, BOOMERANG_SIZE, BOOMERANG_SIZE, BOOMERANG_GRAVITY, degrees, BOOMERANG_SPEED)
	}

	public loop = () => {
	}

	public loopPlayer = (player: Player): void => {
		if (this.hasLifetime(250) && this.isOwner(player) && this.isHit(player)) {
			console.log("Caught")
			this.remove()
			return
		}
		if (!this.isOwner(player) && this.isHit(player)) {
			console.log("Killed")
			player.kill()
			this.remove()
			return
		}
	}

	public loopEntity = (entity: Entity): void => {
		if (!this.isCollidingWithEntity(entity) || this.equals(entity)) {
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