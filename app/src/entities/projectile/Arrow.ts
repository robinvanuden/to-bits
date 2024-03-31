import ItemProjectile from "../ItemProjectile"
import Player from "../entity/Player"
import {GRAVITY} from "../../constants"
import Projectile from "../Projectile"
import MapTile from "../../world/MapTile"
import Bomb from "../entity/Bomb"

export const ARROW_WIDTH = 14
export const ARROW_HEIGHT = 5
export const ARROW_SPEED = 4
export const ARROW_GRAVITY = GRAVITY * .2

export default class Arrow extends ItemProjectile {

	constructor(player: Player, degrees: number) {
		super(player, ARROW_WIDTH, ARROW_HEIGHT, ARROW_GRAVITY, degrees, ARROW_SPEED)
	}

	public loop = () => {
	}

	public loopPlayer = (player: Player): void => {
		if (!this.isThrown()) {
			return
		}
		if (this.collidesWith(player)) {
			player.kill()
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