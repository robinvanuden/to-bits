import {Server} from "socket.io"
import {addPlayer, getWorld, startGame, throwItem} from "../game"
// @ts-expect-error: Unknown type
import {Server as ModServer} from "module:tls"

import {COOKIE_PLAYER_ID, VERSION} from "../constants"
import Projectile from "../entities/Projectile"
import Bomb from "../entities/entity/Bomb"
import {getPlayerRepository} from "../repository/PlayerRepository"
import {getEntityRepository} from "../repository/EntityRepository"
import {Direction} from "../types/model/PlayerModel"
import Player from "../entities/entity/Player"

let code: number
let io: Server

export const startSocketServer = (server: ModServer<unknown, unknown>, codeNum: number) => {
	code = codeNum
	io = new Server(server, {
		allowUpgrades: true,
		connectTimeout: 10_000,
		upgradeTimeout: 5_000
	})

	io.on("connection", client => {
		client.emit("build", code)
		client.emit("version", VERSION)

		const cookieRaw = client?.handshake?.headers?.cookie
		console.log(cookieRaw)
		if (!cookieRaw) {
			console.log("Error: Can't add player without cookie")
			client.emit("nope", true)
			client.disconnect()
			return
		}
		const uuid = cookieRaw?.split(";")?.find(c => c.trim().startsWith(COOKIE_PLAYER_ID))?.trim()?.replace(COOKIE_PLAYER_ID + "=", "")
		if (!uuid || uuid.length === 0) {
			console.log("Error: Can't add player without UUID")
			client.emit("nope", true)
			client.disconnect()
			return
		}
		console.log(uuid)
		const player = addPlayer(uuid, client.id)
		if (!player) {
			console.log("Error: Can't add player")
			client.emit("nope", true)
			client.disconnect()
			return
		}

		sendMessage(`${player.name} joined the game.`)

		broadcastPlayerAdd(player)

		const players = getPlayerRepository().list().map(p => p.toModel()) ?? []
		if (players.length > 0) {
			client.emit("players", players)
		}

		client.emit("textures", getWorld().tileSources())
		client.emit("map_layer", getWorld().solids().toModel())
		client.emit("map_layer", getWorld().semiSolids().toModel())
		client.emit("map_layer", getWorld().teleports().toModel())
		client.emit("map_layer", getWorld().decor().toModel())
		client.emit("map_layer", getWorld().danger().toModel())

		client.on("move.left", (bool: boolean) => onMovement(uuid, "move.left", bool))
		client.on("move.right", (bool: boolean) => onMovement(uuid, "move.right", bool))
		client.on("move.up", (bool: boolean) => onMovement(uuid, "move.up", bool))
		client.on("move.down", (bool: boolean) => onMovement(uuid, "move.down", bool))
		client.on("move.interact", (bool: boolean) => onMovement(uuid, "move.interact", bool))

		client.on("item.1", (bool: boolean) => onItemSelection(uuid, 0, bool))
		client.on("item.2", (bool: boolean) => onItemSelection(uuid, 1, bool))
		client.on("item.3", (bool: boolean) => onItemSelection(uuid, 2, bool))

		client.on("move.action", (bool: boolean) => {
			if (!bool) onAction(uuid)
		})

		client.on("disconnect", () => {
			console.log("User disconnected", uuid)
			const player = getPlayerRepository().getById(uuid)
			if (player) {
				player.disconnect()
				sendMessage(`${player.name} left the game.`)
			}
		})

		startGame(emitProjectiles)
	})
}

export const broadcastPlayerAdd = (player: Player) => {
	io?.emit("playerAdd", player.toModel())
}

export const broadcastPlayerRemove = (player: Player) => {
	io?.emit("playerRemove", player.uid)
}


export const sendMessage = (message: string) => io?.emit("message", message)

const onAction = (uuid: string) => throwItem(uuid)

const onMovement = (uuid: string, direction: string, button_down: boolean) => {
	const player = getPlayerRepository().getById(uuid)
	if (!player || !player.isAlive()) {
		return
	}
	const move: Direction = {u: player.move.u, r: player.move.r, d: player.move.d, l: player.move.l}
	switch (direction) {
	case "move.left":
		move.l = button_down
		break
	case "move.right":
		move.r = button_down
		break
	case "move.up":
		move.u = button_down
		player.look.u = button_down
		break
	case "move.down":
		move.d = button_down
		player.look.d = button_down
		break
	case "move.interact":
		player.interact = button_down
		break
	}
	player.setMove(move)
}

const onItemSelection = (uuid: string, index: number, button_down: boolean) => {
	const player = getPlayerRepository().getById(uuid)
	if (!player || !player.isAlive() || !player.hasPowerUps() || !button_down) {
		return
	}
	player.itemIndex(index)
}

// TODO: Improve ugly fix
const toModel = (projectile: Projectile) => projectile instanceof Bomb ? projectile.toModel(projectile.getExplosion()) : projectile.toModel()

const emitProjectiles = () => {
	// Emit players
	const players = getPlayerRepository().list().map(p => p.toUpdateModel()) ?? []
	if (players.length > 0) {
		io.emit("players_update", players)
	}

	const projectiles = getEntityRepository().list().map(toModel) ?? []
	io.emit("projectiles", projectiles)

	io.emit("map_layer", getWorld().items().toModel())
}