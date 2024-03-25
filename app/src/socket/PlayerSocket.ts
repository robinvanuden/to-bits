import {Server, Socket} from "socket.io"
import Player from "../entities/Player"
import Game from "../game"
// @ts-expect-error: Unknown type
import {Server as ModServer} from "module:tls"

import cookie from "cookie"
import {COOKIE_PLAYER_ID} from "../constants"
import Entity from "../entities/Entity"
import Bomb from "../entities/Bomb"

export default class PlayerSocket {

	private io: Server
	private readonly game: Game

	constructor(game: Game, server: ModServer<unknown, unknown>, code: number) {
		this.game = game
		this.io = new Server(server)

		this.io.on("connection", client => {
			client.emit("build", code)
			client.emit("version", this.game.version())

			const cookies = cookie.parse(client.handshake.headers.cookie || "")
			const uuid = cookies[COOKIE_PLAYER_ID] || ""
			if (uuid.length === 0) {
				client.disconnect()
				client.emit("nope", true)
				return
			}
			if (!this.game.addPlayer(uuid, client.id)) {
				client.disconnect()
				client.emit("nope", true)
				return
			}

			client.emit("map_layer", this.game.world().floor().toModel())

			client.on("move.left", (bool: boolean) => this.onMovement(uuid, "move.left", bool))
			client.on("move.right", (bool: boolean) => this.onMovement(uuid, "move.right", bool))
			client.on("move.up", (bool: boolean) => this.onMovement(uuid, "move.up", bool))
			client.on("move.down", (bool: boolean) => this.onMovement(uuid, "move.down", bool))
			client.on("move.jump", (bool: boolean) => this.onMovement(uuid, "move.jump", bool))

			client.on("radius", (degrees: number) => this.onRadius(uuid, degrees))

			client.on("disconnect", () => {
				if (!this.game) {
					return
				}
				console.log("User disconnected", uuid)
				const player = this.game.players().getById(uuid)
				if (player) {
					player.disconnected = Date.now()
					player.move = {u: false, d: false, l: false, r: false}
				}
			})

			this.game.start(this.emitProjectiles)
		})
	}

	getAddress = (client: Socket): string => {
		const headers = client?.handshake?.headers ?? undefined
		if (headers && headers["x-forwarded-for"]) {
			return client?.handshake?.headers["x-forwarded-for"]?.toString() || ""
		}
		if (client?.handshake?.address) {
			return client?.handshake?.address || ""
		}
		return ""
	}

	onRadius = (uuid: string, degrees: number) => {
		if (!this.game) {
			return
		}
		this.game.throwItem(uuid, degrees)
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
			if (button_down && !player.look.l) {
				player.look.l = true
				player.look.r = false
			} else if (!button_down && player.move.r) {
				player.look.l = false
				player.look.r = true
			}
			break
		case "move.right":
			player.move.r = button_down
			if (button_down && !player.look.r) {
				player.look.r = true
				player.look.l = false
			} else if (!button_down && player.move.l) {
				player.look.r = false
				player.look.l = true
			}
			break
		case "move.up":
			player.move.u = button_down
			player.look.u = button_down
			break
		case "move.down":
			player.move.d = button_down
			player.look.d = button_down
			break
		case "move.jump":
			player.move.u = button_down
			break
		}
	}

	private toModel = (entity: Entity) => {
		if (entity instanceof Bomb) {
			return Bomb.toModel(entity, entity.getExplosion())
		}
		return Entity.toModel(entity)
	}

	emitProjectiles = () => {
		// Emit players
		this.io.emit("players", this.game?.players().list().map(Player.toModel) ?? [])

		this.io.emit("projectiles", this.game?.entities().list().map(this.toModel) ?? [])

		this.io.emit("map_layer", this.game.world().powers().toModel())
	}
}