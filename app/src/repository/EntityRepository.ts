import Entity from "../entities/Entity"
import {PowerType} from "../entities/PowerUp"
import Player from "../entities/Player"

export default class EntityRepository {

	private entities: Entity[] = []

	public list = () => this.entities

	public throwBoomerang = (player: Player, degrees: number) => {
		this.entities.push(Entity.create(player, PowerType.BOOMERANG, degrees))
	}

	public throwFireball = (player: Player, degrees: number) => {
		this.entities.push(Entity.create(player, PowerType.FIREBALL, degrees))
	}

	public placeBomb = (player: Player) => {
		this.entities.push(Entity.create(player, PowerType.BOMB, 0))
	}

	public remove = (entity: Entity) => {
		this.entities = this.entities.filter(e => !entity.equals(e))
	}
}