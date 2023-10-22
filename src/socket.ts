import {Server, Socket} from "socket.io"
import {v4, v5} from "uuid"
import Game from "./game"
import {Player, PowerUp} from "./types/player"

export default class SocketController {

  private io: Server
  private readonly version: string
  private uuid_seed: string
  private connected_ids: string[] = []
  private game: Game | undefined

  constructor(server: any, version: string) {
    this.io = new Server(server)
    this.version = version
    this.uuid_seed = v4()
    this.connected_ids = []
    this.init()
  }

  reset = () => {
    this.uuid_seed = v4()
  }

  getAddress = (client: Socket): string => {
    const headers = client?.handshake?.headers ?? undefined
    if (headers && headers.hasOwnProperty("x-forwarded-for")) {
      return client?.handshake?.headers["x-forwarded-for"]?.toString() || ""
    }
    if (client?.handshake?.address) {
      return client?.handshake?.address
    }
    return ""
  }

  onRadius = (uuid: string, degrees: number) => {
    if (!this.game) {
      return
    }
    const player = this.game.players().get(uuid)
    if (player && player.hasPowerUp(PowerUp.BOOMERANG)) this.game.boomerangs().create(player, degrees)
  }

  emitPlayers = () => this.io.emit("players", this.game?.players().list().map(Player.toModel) ?? [])

  emitBoomerangs = () => this.io.emit("boomerangs", this.game?.boomerangs().list() ?? [])

  emitProjectiles = () => {
    this.emitPlayers()
    this.emitBoomerangs()
  }

  private init() {
    this.io.on("connection", client => {
      if (!this.game) {
        console.log("Start game instance")
        this.game = new Game()
      }
      const address: string = this.getAddress(client)
      if (address === "") {
        console.log("No address")
        return
      }
      const uuid = v5(address, this.uuid_seed)
      if (this.connected_ids.find(addr => addr === address)) {
        console.log("Disconnect double user", address)
        client.disconnect(true)
        return
      }
      this.connected_ids.push(address)
      this.game.start(this.emitProjectiles)
      client.emit("version", this.version)
      let continue_player = this.game.players().getConnected(uuid)
      if (continue_player) {
        // Reconnect
        continue_player.socket = client.id
        continue_player.disconnected = undefined
        continue_player.move = {u: false, d: false, l: false, r: false}
        console.log('User reconnected', client.id, uuid)
      } else {
        // New player
        const SPAWN_TILE = this.game.map().randomSpawn()
        console.log('User connected', uuid)
        this.game.players().create(SPAWN_TILE, uuid, client.id)
      }
      client.emit("map", this.game.map().map())

      client.on("move.left", (bool: boolean) => {
        if (!this.game) {
          return
        }
        const player = this.game.players().get(uuid)
        if (!player) {
          return
        }
        player.move.l = bool
        if (bool && !player.look.l) {
          player.look = {u: false, d: false, l: true, r: false}
        }
      })
      client.on("move.right", (bool: boolean) => {
        if (!this.game) {
          return
        }
        const player = this.game.players().get(uuid)
        if (!player) {
          return
        }
        player.move.r = bool
        if (bool && !player.look.r) {
          player.look = {u: false, d: false, l: false, r: true}
        }
      })
      client.on("move.up", (bool: boolean) => {
        if (!this.game) {
          return
        }
        const player = this.game.players().get(uuid)
        if (player) {
          player.move.u = bool
          player.look.u = bool
        }
      })
      client.on("move.down", (bool: boolean) => {
        if (!this.game) {
          return
        }
        const player = this.game.players().get(uuid)
        if (player) {
          player.move.d = bool
          player.look.d = bool
        }
      })
      client.on("move.jump", (bool: boolean) => {
        if (!this.game) {
          return
        }
        const player = this.game.players().get(uuid)
        if (player) player.move.u = bool
      })

      client.on("radius", (degrees: number) => this.onRadius(uuid, degrees))

      client.on("disconnect", () => {
        if (!this.game) {
          return
        }
        console.log('User disconnected', uuid)
        const player = this.game.players().get(uuid)
        if (player) player.disconnected = Date.now()
        this.connected_ids = this.connected_ids.filter(addr => addr !== address)
      })
    })
  }
}