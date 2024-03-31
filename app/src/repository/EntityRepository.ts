import Projectile from "../entities/Projectile"
import Player from "../entities/entity/Player"
import Boomerang from "../entities/projectile/Boomerang"
import Fireball from "../entities/projectile/Fireball"
import Bomb from "../entities/entity/Bomb"
import Arrow from "../entities/projectile/Arrow"

export default class EntityRepository {

	private entities: Projectile[] = []

	public list = () => this.entities

	public exclude = (entity: Projectile) => this.entities.filter(e => !e.equals(entity))

	public shootArrow = (player: Player, degrees: number) => {
		this.entities.push(new Arrow(player, degrees))
	}

	public throwBoomerang = (player: Player, degrees: number) => {
		this.entities.push(new Boomerang(player, degrees))
	}

	public throwFireball = (player: Player, degrees: number) => {
		this.entities.push(new Fireball(player, degrees))
	}

	public placeBomb = (player: Player) => {
		this.entities.push(new Bomb(player))
	}

	public remove = (entity: Projectile) => {
		this.entities = this.entities.filter(e => !entity.equals(e))
	}
}