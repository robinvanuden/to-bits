import {createServer} from "http"
import express from "express"
import {Server} from "socket.io"
import {v4, v5} from "uuid"
import {createBoomerang} from "./controller/controllerBoomerang"
import Game from "./game"

const app = express()
const server = createServer(app)
const io = new Server(server)

app.use("/", express.static("public"))

const UUID = v4()

const game = new Game()

const VERSION = process.env.npm_package_version
console.log("ToBits: v" + VERSION)

app.get("/delta", (_, res) => res.json(game.getDelta()))

io.on('connection', (socket) => {
  const address = socket?.handshake?.address ?? ""
  if (address === "") {
    return
  }
  const uuid = v5(address, UUID)
  if (game.getPlayers().isConnected(UUID)) {
    // Disconnect double users
    socket.disconnect(true)
    return
  }
  game.start(emitPlayers)
  socket.emit("version", VERSION)
  let continue_player = game.getPlayers().getConnected(uuid)
  if (continue_player) {
    // Reconnect
    continue_player.disconnected = undefined
    continue_player.move = {u: false, d: false, l: false, r: false}
    console.log('User reconnected', uuid)
  } else {
    // New player
    const SPAWN_TILE = game.map().randomSpawn()
    console.log('User connected', uuid)
    game.getPlayers().create(SPAWN_TILE, uuid)
  }
  socket.emit("me", uuid)
  socket.emit("map", game.map().getMap())
  emitPlayers()

  socket.on("move.left", (bool: boolean) => {
    const player = game.getPlayers().get(uuid)
    if (player) player.move.l = bool
    if (player && bool && !player.look.l) player.look = {
      u: false,
      d: false,
      l: true,
      r: false
    }
  })
  socket.on("move.right", (bool: boolean) => {
    const player = game.getPlayers().get(uuid)
    if (player) player.move.r = bool
    if (player && bool && !player.look.r) player.look = {
      u: false,
      d: false,
      l: false,
      r: true
    }
  })
  socket.on("move.up", (bool: boolean) => {
    const player = game.getPlayers().get(uuid)
    if (player) player.move.u = bool
    if (player && bool && !player.look.u) player.look = {
      u: true,
      d: false,
      l: false,
      r: false
    }
  })
  socket.on("move.down", (bool: boolean) => {
    const player = game.getPlayers().get(uuid)
    if (player) player.move.d = bool
    if (player && bool && !player.look.d) player.look = {
      u: false,
      d: true,
      l: false,
      r: false
    }
  })
  socket.on("boomerang", (degrees: number) => {
    const player = game.getPlayers().get(uuid)
    if (!player || player.boomerangs.length > 0) {
      return
    }
    player.boomerangs.push(createBoomerang(player, degrees))
  })

  socket.on("disconnect", () => {
    console.log('User disconnected', uuid)
    const player = game.getPlayers().get(uuid)
    if (player) player.disconnected = Date.now()
  })
})

const emitPlayers = () => io.emit("players", game.getPlayers().list())


const PORT: number = Number.parseInt(process.env.PORT ?? "80")
server.listen(PORT, () => {
  console.log(`listening on ${PORT}`)
})