import {getPlayerRepository} from "./repository/PlayerRepository"
import {v4, v5} from "uuid"
import WorldLoader, {useWorld1} from "./world/WorldLoader"
import {getEntityRepository} from "./repository/EntityRepository"
import {PowerType} from "./entities/PowerUp"
import {TICK_SPEED} from "./constants"
import {DamageCause} from "./entities/entity/Damage"
import Bomb from "./entities/entity/Bomb"
import Arrow from "./entities/projectile/Arrow"
import Boomerang from "./entities/projectile/Boomerang"
import Fireball from "./entities/projectile/Fireball"
import Player from "./entities/entity/Player"
import {broadcastPlayerAdd, broadcastPlayerRemove, sendMessage} from "./socket/PlayerSocket"

export const getNow = () => Date.now()

let running = false
let updated = getNow()
let seed: string = v4()

const uuid_seed = () => seed

const generateSeed = () => {
	seed = v4()
	console.log("Seed generated: ", uuid_seed())
}

export const generate_uuid = () => v5(getNow().toString(), uuid_seed())

export const getWorld = (): WorldLoader => useWorld1()

export const addPlayer = (uuid: string, socket_id: string): Player | null => {
	const continue_player = getPlayerRepository().getConnected(uuid)
	if (continue_player) {
		// Reconnect
		console.log("User reconnected", socket_id, uuid)
		continue_player.reconnect(socket_id)
		return continue_player
	}
	const player = getPlayerRepository().getById(uuid)
	if (!player) {
		// New player_id
		const SPAWN_TILE = getWorld().pickRandomSpawnPoint()
		if (!SPAWN_TILE) {
			return null
		}
		console.log("User connected", uuid)
		return getPlayerRepository().create(SPAWN_TILE, uuid, socket_id)
	}
	return null
}

const updateTerrain = (delta: number) => {
	const dangers = getWorld().danger().tiles()
	const solids = getWorld().solids().tiles()
	const semi_solids = getWorld().semiSolids().tiles()
	const power_up_spawns = getWorld().items().tiles()
	const teleports = getWorld().teleports().tiles()
	getWorld().spawnPowerUp()

	for (const entity of getEntityRepository().list()) {
		// Projectile loop
		if (entity.isOverdue() || getWorld().isEntityInVoid(entity)) {
			getEntityRepository().remove(entity)
		} else {
			entity.loopGravity(delta)

			entity.loop()

			for (const entity2 of getEntityRepository().exclude(entity)) {
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

	for (const player of getPlayerRepository().alive()) {
		// Player loop
		if (getWorld().isPlayerInVoid(player)) {
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

			for (const other of getPlayerRepository().othersAlive(player)) {
				player.hits(other)
			}

			for (const entity of getEntityRepository().list()) entity.loopPlayer(player)

			for (const power_tile of power_up_spawns) {
				if (player.isTouching(power_tile) && player.addPowerUp(power_tile.power_up)) {
					power_tile.power_up = undefined
				}
			}
			const danger = dangers.find(t => player.collidesWith(t))
			if (danger) {
				player.damage(danger.damage, DamageCause.BLOCK, {tile: danger})
			}
			const teleport = teleports.find(t => player.collidesWith(t))
			if (teleport && player.interact) {
				const random = getWorld().pickRandomTeleport()
				if (random) {
					player.interact = false
					player.teleport(random)
				}
			}
		}
		if (!player.isAlive()) {
			switch (player.damaged()?.cause || DamageCause.NONE) {
			case DamageCause.FALL:
				sendMessage(`${player.name} found the end of the world.`)
				break
			case DamageCause.PLAYER:
				sendMessage(`${player.name} was killed by ${player.damaged()?.player?.name || ""}.`)
				break
			case DamageCause.ITEM:
				if (player.damaged()?.projectile instanceof Bomb) {
					sendMessage(`${player.name} blew up.`)
				} else if (player.damaged()?.projectile instanceof Arrow) {
					sendMessage(`${player.name} is now a hedgehog.`)
				} else if (player.damaged()?.projectile instanceof Boomerang) {
					sendMessage(`${player.name} was killed by a boomerang.`)
				} else if (player.damaged()?.projectile instanceof Fireball) {
					sendMessage(`${player.name} went up in flames.`)
				}
				break
			case DamageCause.BLOCK:
				const tile = player.damaged()?.tile
				if (tile?.name === "spikes") {
					sendMessage(`${player.name} had a prickly end.`)
				} else {
					sendMessage(`${player.name} was crushed ${tile?.name || ""}.`)
				}
				break
			default:
				sendMessage(`${player.name} died.`)
				break
			}
			broadcastPlayerAdd(player)
		}
	}
}

const checkDisconnectedPlayers = () => {
	for (const player of getPlayerRepository().disconnected()) {
		console.log("Remove player:", player.id)
		broadcastPlayerRemove(player)
		getPlayerRepository().remove(player)
	}
}

const checkRespawnPlayers = () => {
	for (const player of getPlayerRepository().respawns()) {
		console.log("Respawn player:", player.id)
		const spawn = getWorld().pickRandomSpawnPoint()
		if (spawn) {
			player.respawn(spawn)
			broadcastPlayerAdd(player)
		}
	}
}

const tick = (delta: number) => {
	updateTerrain(delta)
	checkRespawnPlayers()
	checkDisconnectedPlayers()
}

const loop = (run: () => void) => {
	let now = getNow()
	tick(now - updated)
	run()
	updated = now
	if (!getPlayerRepository().filled()) stopGame()
	if (running) setTimeout(() => loop(run), TICK_SPEED)
}

export const startGame = (run: () => void) => {
	if (!running) {
		generateSeed()
		running = true
		console.log("Started game loop")
		updated = getNow()
		loop(run)
	}
}

const stopGame = () => {
	console.log("Stopped game loop")
	running = false
	getWorld().clearPowerUps()
	generateSeed()
}
export const throwItem = (uuid: string) => {
	const player = getPlayerRepository().getById(uuid)
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
		getEntityRepository().shootArrow(player)
		break
	case PowerType.BOMB:
		player.usePowerUp(powerUp)
		getEntityRepository().placeBomb(player)
		break
	case PowerType.BOOMERANG:
		player.usePowerUp(powerUp)
		getEntityRepository().throwBoomerang(player)
		break
	case PowerType.FIREBALL:
		player.usePowerUp(powerUp)
		getEntityRepository().throwFireball(player)
		break
	case PowerType.SWORD:
		player.doSwing()
		break
	}
}