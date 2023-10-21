import {Server} from "socket.io"
import {v4, v5} from "uuid"
import Game from "./game"
import {Player, PowerUp} from "./types/player"

export const startSocket = (server: any, VERSION: string) => {
  const UUID_SEED = v4()
  const game = new Game()

  const io = new Server(server)
  io.on('connection', client => {
    const address: string = getAddress(client)
    if (address === "") {
      return
    }
    const uuid = v5(address, UUID_SEED)
    if (game.players().isConnected(uuid)) {
      // Disconnect double users
      client.disconnect(true)
      return
    }
    game.start(emitProjectiles)
    client.emit("version", VERSION)
    let continue_player = game.players().getConnected(uuid)
    if (continue_player) {
      // Reconnect
      continue_player.socket = client.id
      continue_player.disconnected = undefined
      continue_player.move = {u: false, d: false, l: false, r: false}
      console.log('User reconnected', client.id, uuid)
    } else {
      // New player
      const SPAWN_TILE = game.map().randomSpawn()
      console.log('User connected', uuid)
      game.players().create(SPAWN_TILE, uuid, client.id)
    }
    client.emit("map", game.map().map())

    client.on("move.left", (bool: boolean) => {
      const player = game.players().get(uuid)
      if (!player) {
        return
      }
      player.move.l = bool
      if (bool && !player.look.l) {
        player.look = {u: false, d: false, l: true, r: false}
      }
    })
    client.on("move.right", (bool: boolean) => {
      const player = game.players().get(uuid)
      if (!player) {
        return
      }
      player.move.r = bool
      if (bool && !player.look.r) {
        player.look = {u: false, d: false, l: false, r: true}
      }
    })
    client.on("move.up", (bool: boolean) => {
      const player = game.players().get(uuid)
      if (player) {
        player.move.u = bool
        player.look.u = bool
      }
    })
    client.on("move.down", (bool: boolean) => {
      const player = game.players().get(uuid)
      if (player) {
        player.move.d = bool
        player.look.d = bool
      }
    })
    client.on("move.jump", (bool: boolean) => {
      const player = game.players().get(uuid)
      if (player) player.move.u = bool
    })

    client.on("radius", (degrees: number) => onRadius(uuid, degrees))

    client.on("disconnect", () => {
      console.log('User disconnected', uuid)
      const player = game.players().get(uuid)
      if (player) player.disconnected = Date.now()
    })
  })

  const getAddress = (client: any): string => (client?.handshake?.headers['x-forwarded-for'] || client?.handshake?.address || "").toString()

  const onRadius = (uuid: string, degrees: number) => {
    const player = game.players().get(uuid)
    if (player && player.hasPowerUp(PowerUp.BOOMERANG)) game.boomerangs().create(player, degrees)
  }

  const emitPlayers = () => io.emit("players", game.players().list().map(Player.toModel))

  const emitBoomerangs = () => io.emit("boomerangs", game.boomerangs().list())

  const emitProjectiles = () => {
    emitPlayers()
    emitBoomerangs()
  }

}