import Player from "./entity/Player"
import MapTile from "../world/MapTile"
import ProjectileModel from "../types/ProjectileModel"
import {ExplosionModel} from "../../public/js/model/EntityModel"
import Entity from "./Entity"

export default abstract class Projectile extends Entity {

	protected readonly player: Player

	public vx: number = 0 // x velocity
	public vy: number = 0 // y velocity

	public damage: number
	public gravity: number = 0
	public timeRemove: number = 20000

	public readonly timeSpawned: number = 0

	protected constructor(
		player: Player,
		width: number,
		height: number,
		gravity: number,
		damage: number
	) {
		super(player.x + player.width * .5, player.y + player.height * .5, width, height)
		this.player = player
		this.damage = damage
		this.gravity = gravity
		this.timeSpawned = Date.now()
	}

	public isWalkingOn = (tile: MapTile): boolean =>
		this.isWithinX(tile) &&
		tile.y < this.y + this.height &&
		tile.y + 1 > this.y

	protected isOwner = (p: Player) => this.player.equals(p)

	protected hasLifetime = (milliseconds: number) => (Date.now() - this.timeSpawned) >= milliseconds

	public loop(): void {
	}

	public abstract loopPlayer(player: Player): void

	public abstract loopEntity(entity: Projectile): void

	public abstract loopTile(entity: MapTile): void

	public loopGravity(delta: number) {
		this.vy += this.gravity * delta
		this.x += this.vx
		this.y += this.vy
	}

	public remove = () => {
		this.timeRemove = -1000
	}

	public isOverdue = () => this.hasLifetime(this.timeRemove)

	public toModel = (e: ExplosionModel | undefined = undefined): ProjectileModel => ({
		id: this.id,
		p: this.player.id,
		s: this.timeSpawned,
		t: String(this.constructor.name).toUpperCase(),
		x: this.x,
		y: this.y,
		w: this.width,
		h: this.height,
		vx: this.vx,
		vy: this.vy,
		e: e
	})
}

