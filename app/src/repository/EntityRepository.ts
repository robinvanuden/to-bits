import Projectile from "../entities/Projectile"
import Player from "../entities/entity/Player"
import Fireball from "../entities/projectile/Fireball"
import Bomb from "../entities/entity/Bomb"

export default class EntityRepository {

	private entities: Projectile[] = []

	public list = () => this.entities

	public exclude = (entity: Projectile) => this.entities.filter(e => !e.equals(entity))

	public throwFireball = (player: Player) => {
		this.entities.push(new Fireball(player))
	}

	public placeBomb = (player: Player) => {
		this.entities.push(new Bomb(player))
	}

	public remove = (entity: Projectile) => {
		this.entities = this.entities.filter(e => !entity.equals(e))
	}
}

let repository: EntityRepository | undefined

export const getEntityRepository = () => {
	if (repository) return repository
	repository = new EntityRepository()
	return repository
}