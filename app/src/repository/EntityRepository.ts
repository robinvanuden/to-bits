import Entity from "../entities/Entity"
import Player from "../entities/Player"
import Boomerang from "../entities/Boomerang"
import Fireball from "../entities/Fireball"
import Bomb from "../entities/Bomb"

export default class EntityRepository {

	private entities: Entity[] = []

	public list = () => this.entities

	public throwBoomerang = (player: Player, degrees: number) => {
		this.entities.push(new Boomerang(player, degrees))
	}

	public throwFireball = (player: Player, degrees: number) => {
		this.entities.push(new Fireball(player, degrees))
	}

	public placeBomb = (player: Player) => {
		this.entities.push(new Bomb(player))
	}

	public remove = (entity: Entity) => {
		this.entities = this.entities.filter(e => !entity.equals(e))
	}
}