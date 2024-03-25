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
			this.remove()
			return
		}
		if (!this.isOwner(player) && this.isHit(player)) {
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
			entity.explode()
		} else {
			entity.remove()
		}
	}

	public loopTile = (tile: MapTile): void => {
		if (this.isColliding(tile)) {
			this.remove()
		}
	}

}