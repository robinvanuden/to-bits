import {Server, Socket} from "socket.io"
import {v5} from "uuid"
import {Player} from "../types/Player"
import Tile from "../types/Tile"
import PowerUp from "../types/PowerUp"
import Game from "../game"

export default class PlayerSocket {

  private io: Server
  private connected_ids: string[] = []
  private readonly game: Game

  constructor(game: Game, server: any) {
    this.game = game
    this.io = new Server(server)
    this.connected_ids = []

    this.io.on("connection", client => {
      const address: string = this.getAddress(client)
      if (address === "") {
        console.log("No address")
        client.emit("nope", true)
        return
      }
      if (this.connected_ids.find(addr => addr === address)) {
        console.log("Disconnect double user", address)
        client.emit("nope", true)
        client.disconnect(true)
        return
      }
      this.connected_ids.push(address)
      client.emit("version", this.game.version())

      const uuid = v5(address, this.game.uuid_seed())
      this.game.addPlayer(uuid, client.id)

      client.emit("map", this.game.map().map().map(Tile.toModel))

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
        console.log('User disconnected', uuid)
        const player = this.game.players().getById(uuid)
        if (player) player.disconnected = Date.now()
        this.connected_ids = this.connected_ids.filter(addr => addr !== address)
      })

      this.game.start(this.emitProjectiles)
    })
  }

  getAddress = (client: Socket): string => {
    const headers = client?.handshake?.headers ?? undefined
    if (headers && headers.hasOwnProperty("x-forwarded-for")) {
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

  onMovement = (uuid: string, direction: string, bool: boolean) => {
    if (!this.game) {
      return
    }
    const player = this.game.players().getById(uuid)
    if (!player) {
      return
    }
    switch (direction) {
      case "move.left":
        player.move.l = bool
        if (bool && !player.look.l) {
          player.look = {u: false, d: false, l: true, r: false}
        }
        break
      case "move.right":
        player.move.r = bool
        if (bool && !player.look.r) {
          player.look = {u: false, d: false, l: false, r: true}
        }
        break
      case "move.up":
        player.move.u = bool
        player.look.u = bool
        break
      case "move.down":
        player.move.d = bool
        player.look.d = bool
        break
      case "move.jump":
        player.move.u = bool
        break
    }
  }

  emitProjectiles = () => {
    // Emit players
    this.io.emit("players", this.game?.players().list().map(Player.toModel) ?? [])

    // Emit power ups
    this.io.emit("power_ups", this.game?.map().map().filter(t => t.power_up).flatMap(t => PowerUp.toMaybeModel(t.power_up)))
  }
}