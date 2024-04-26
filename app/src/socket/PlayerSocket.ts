import {Server} from "socket.io"
import Game from "../game"
// @ts-expect-error: Unknown type
import {Server as ModServer} from "module:tls"

import cookie from "cookie"
import {COOKIE_PLAYER_ID} from "../constants"
import Projectile from "../entities/Projectile"
import Bomb from "../entities/entity/Bomb"

export default class PlayerSocket {

	private io: Server
	private readonly game: Game

	constructor(game: Game, server: ModServer<unknown, unknown>, code: number) {
		this.game = game
		this.io = new Server(server, {
			allowUpgrades: true,
			connectTimeout: 10_000,
			upgradeTimeout: 5_000
		})

		this.io.on("connection", client => {
			client.emit("build", code)
			client.emit("version", this.game.version())

			const cookies = cookie.parse(client.handshake.headers.cookie || "")
			const uuid = cookies[COOKIE_PLAYER_ID] || ""
			if (uuid.length === 0) {
				console.log("Error: Can't add player without UUID")
				client.emit("nope", true)
				client.disconnect()
				return
			}
			if (!this.game.addPlayer(uuid, client.id)) {
				console.log("Error: Can't add player")
				client.emit("nope", true)
				client.disconnect()
				return
			}

			client.emit("textures", this.game.world().tileSources())
			client.emit("map_layer", this.game.world().floor().toModel())

			client.on("move.left", (bool: boolean) => this.onMovement(uuid, "move.left", bool))
			client.on("move.right", (bool: boolean) => this.onMovement(uuid, "move.right", bool))
			client.on("move.up", (bool: boolean) => this.onMovement(uuid, "move.up", bool))
			client.on("move.down", (bool: boolean) => this.onMovement(uuid, "move.down", bool))

			client.on("move.action", (bool: boolean) => {
				if (!bool) this.onAction(uuid)
			})

			client.on("disconnect", () => {
				if (!this.game) {
					return
				}
				console.log("User disconnected", uuid)
				const player = this.game.players().getById(uuid)
				if (player) player.disconnect()
			})

			this.game.start(this.emitProjectiles)
		})
	}

	onAction = (uuid: string) => {
		if (!this.game) {
			return
		}
		this.game.throwItem(uuid)
	}

	onMovement = (uuid: string, direction: string, button_down: boolean) => {
		if (!this.game) {
			return
		}
		const player = this.game.players().getById(uuid)
		if (!player || !player.isAlive()) {
			return
		}
		switch (direction) {
		case "move.left":
			player.move.l = button_down
			break
		case "move.right":
			player.move.r = button_down
			break
		case "move.up":
			player.move.u = button_down
			player.look.u = button_down
			break
		case "move.down":
			player.move.d = button_down
			player.look.d = button_down
			break
		}
	}

	private toModel = (entity: Projectile) => {
		return entity instanceof Bomb ? entity.toModel(entity.getExplosion()) : entity.toModel()
	}

	emitProjectiles = () => {
		// Emit players
		const players = this.game?.players().list().map(p => p.toModel()) ?? []
		if (players.length > 0) this.io.emit("players", players)

		const projectiles = this.game?.entities().list().map(this.toModel) ?? []
		this.io.emit("projectiles", projectiles)

		this.io.emit("map_layer", this.game.world().powers().toModel())
	}
}