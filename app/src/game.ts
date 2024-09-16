import PlayerRepository from "./repository/PlayerRepository"
import {v4, v5} from "uuid"
import WorldLoader, {useWorld1} from "./world/WorldLoader"
import EntityRepository from "./repository/EntityRepository"
import {PowerType} from "./entities/PowerUp"
import {TICK_SPEED} from "./constants"
import {DamageCause} from "./entities/entity/Damage"
import Bomb from "./entities/entity/Bomb"
import Arrow from "./entities/projectile/Arrow"
import Boomerang from "./entities/projectile/Boomerang"
import Fireball from "./entities/projectile/Fireball"
import Player from "./entities/entity/Player"

export default class Game {

	private readonly VERSION: string = "?.?.?"

	private UUID_SEED: string = ""

	private playerRepository!: PlayerRepository
	private entityRepository!: EntityRepository

	private running: boolean = false
	private updated: number

	constructor(VERSION: string) {
		this.VERSION = VERSION
		this.updated = Game.getNow()
		this.generate_seed()
	}

	uuid_seed = () => this.UUID_SEED

	generate_seed = () => {
		this.UUID_SEED = v4()
		console.log("Seed generated: ", this.uuid_seed())
	}

	generate_uuid = () => v5(Game.getNow() + "", this.uuid_seed())

	version = () => this.VERSION

	players = () => this.playerRepository

	setPlayersRepository = (players: PlayerRepository) => this.playerRepository = players

	entities = () => this.entityRepository

	setEntityRepository = (entities: EntityRepository) => this.entityRepository = entities

	world = (): WorldLoader => useWorld1()

	addPlayer = (uuid: string, socket_id: string): Player | null => {
		const continue_player = this.players().getConnected(uuid)
		if (continue_player) {
			// Reconnect
			console.log("User reconnected", socket_id, uuid)
			continue_player.reconnect(socket_id)
			return continue_player
		}
		const player = this.players().getById(uuid)
		if (!player) {
			// New player_id
			const SPAWN_TILE = this.world().pickRandomSpawnPoint()
			if (!SPAWN_TILE) {
				return null
			}
			console.log("User connected", uuid)
			return this.players().create(SPAWN_TILE, uuid, socket_id)
		}
		return null
	}

	private updateTerrain = (delta: number) => {
		const dangers = this.world().danger().tiles()
		const solids = this.world().solids().tiles()
		const semi_solids = this.world().semiSolids().tiles()
		const power_up_spawns = this.world().items().tiles()
		this.world().spawnPowerUp()

		for (const entity of this.entities().list()) {
			// Projectile loop
			if (entity.isOverdue() || this.world().isEntityInVoid(entity)) {
				this.entities().remove(entity)
			} else {
				entity.loopGravity(delta)

				entity.loop()

				for (const entity2 of this.entities().exclude(entity)) {
					if (entity instanceof Bomb && entity2 instanceof Bomb) {
						if (entity.isInOtherExplosion(entity2)) {
							entity.explode()
						}
					}
					if (entity.collidesWith(entity2)) {
						if (entity instanceof Bomb && !(entity2 instanceof Bomb)) {
							entity.explode()
							entity2.remove()
						} else if (entity instanceof Fireball) {
							if (!(entity2 instanceof Bomb)) {
								entity2.remove()
							}
						}
					}
				}

				const solid = solids.find(t => entity.collidesWith(t))
				const semi = semi_solids.find(t => entity.collidesWith(t))

				if (entity instanceof Bomb) {
					if (solid && entity.isWalkingOn(solid) && entity.vy > 0) {
						entity.y = solid.y - entity.height
						entity.vx = 0
						entity.vy = 0
					}
					if (semi && entity.isWalkingOn(semi) && entity.vy > 0) {
						entity.y = semi.y - entity.height
						entity.vx = 0
						entity.vy = 0
					}
				} else if (entity instanceof Arrow || entity instanceof Fireball) {
					if (solid && entity.collidesWith(solid)) {
						entity.remove()
					}
				} else if (entity instanceof Boomerang) {
					if (solid && entity.collidesWith(solid)) {
						entity.retrieve()
					}
				}
			}
		}

		for (const player of this.players().alive()) {
			// Player loop
			if (this.world().isPlayerInVoid(player)) {
				player.damage(100, DamageCause.FALL)
			} else {
				if (player.move.l && !player.look.l) {
					player.look.l = true
					player.look.r = false
				} else if (player.move.l) {
					player.x -= player.speedWalking
					if (solids.find(t => player.collidesWith(t))) player.x += player.speedWalking
				}
				if (player.move.r && !player.look.r) {
					player.look.r = true
					player.look.l = false
				} else if (player.move.r) {
					player.x += player.speedWalking
					if (solids.find(t => player.collidesWith(t))) player.x -= player.speedWalking
				}
				if (player.move.u && player.canJump() && !solids.find(t => player.collidesWith(t))) {
					player.vy -= player.speedJumping
					player.grounded = false
				}

				player.vy += player.gravity * delta
				player.x += player.vx
				player.y += player.vy


				const solid = solids.find(t => player.collidesWith(t))
				if (solid && player.vy > 0 && player.isWalkingOn(solid)) {
					player.damageFall(player.vy)
					player.y = solid.y - player.height
					player.vy = 0
					player.grounded = true
				} else if (solid && player.vy > 0) {
					player.damageFall(player.vy)
					player.y = solid.y - player.height
					player.vy = 0
					player.grounded = true
				} else if (solid && player.vy <= 0) {
					player.y = solid.y + solid.height
					player.vy = 0
					player.grounded = false
				}

				if (player.move.d && semi_solids.find(t => player.isWalkingOn(t))) {
					player.vy += player.gravity * delta
				}

				const semi_solid = semi_solids.find(t => player.isWalkingOn(t))
				if (!player.move.d && semi_solid && player.vy > 0) {
					player.damageFall(player.vy)
					// If y-velocity is higher than 0 (falling)
					player.y = semi_solid.y - player.height
					player.vy = 0
					player.grounded = true
				}

				for (const other of this.players().othersAlive(player)) {
					player.hits(other)
				}

				for (const entity of this.entities().list()) entity.loopPlayer(player)

				for (const power_tile of power_up_spawns) {
					if (player.isTouching(power_tile) && player.addPowerUp(power_tile.power_up)) {
						power_tile.power_up = undefined
					}
				}
				const danger = dangers.find(t => player.collidesWith(t))
				if (danger) {
					player.damage(danger.damage, DamageCause.BLOCK, {tile: danger})
				}
			}
		}
	}

	private checkDisconnectedPlayers = () => {
		for (const player of this.players().disconnected()) {
			console.log("Remove player:", player.id)
			this.players().remove(player)
		}
	}

	private checkRespawnPlayers = () => {
		for (const player of this.players().respawns()) {
			console.log("Respawn player:", player.id)
			const spawn = this.world().pickRandomSpawnPoint()
			if (spawn) player.respawn(spawn)
		}
	}

	private tick = (delta: number) => {
		this.updateTerrain(delta)
		this.checkRespawnPlayers()
		this.checkDisconnectedPlayers()
	}

	private loop = (run: () => void) => {
		let now = Game.getNow()
		this.tick(now - this.updated)
		run()
		this.updated = now
		if (!this.players().filled()) this.stop()
		if (this.running) setTimeout(() => this.loop(run), TICK_SPEED)
	}

	start = (run: () => void) => {
		if (!this.running) {
			this.running = true
			console.log("Started game loop")
			this.updated = Game.getNow()
			this.loop(run)
		}
	}

	stop = () => {
		console.log("Stopped game loop")
		this.running = false
		this.world().clearPowerUps()
		this.generate_seed()
	}

	throwItem = (uuid: string) => {
		const player = this.players().getById(uuid)
		if (!player || !player.isAlive()) {
			return
		}
		const powerUp = player.getSelectedPowerUp()
		if (!powerUp) {
			player.doSwing()
			return
		}
		switch (powerUp.type) {
		case PowerType.ARROW:
			player.usePowerUp(powerUp)
			this.entities().shootArrow(player)
			break
		case PowerType.BOMB:
			player.usePowerUp(powerUp)
			this.entities().placeBomb(player)
			break
		case PowerType.BOOMERANG:
			player.usePowerUp(powerUp)
			this.entities().throwBoomerang(player)
			break
		case PowerType.FIREBALL:
			player.usePowerUp(powerUp)
			this.entities().throwFireball(player)
			break
		case PowerType.SWORD:
			player.doSwing()
			break
		}
	}

	public static getNow = () => Date.now()
}