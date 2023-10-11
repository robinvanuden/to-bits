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
  } else {
    // New player
    const SPAWN_TILE = game.map().randomSpawn()
    console.log('address user connected', uuid)
    game.getPlayers().create(SPAWN_TILE, uuid)
  }
  socket.emit("me", uuid)
  socket.emit("map", game.map().getMap())
  emitPlayers()

  socket.on("move.left", (bool: boolean) => {
    const player = game.getPlayers().get(uuid)
    if (player) player.move.l = bool
  })
  socket.on("move.right", (bool: boolean) => {
    const player = game.getPlayers().get(uuid)
    if (player) player.move.r = bool
  })
  socket.on("move.up", (bool: boolean) => {
    const player = game.getPlayers().get(uuid)
    if (player) player.move.u = bool
  })
  socket.on("move.down", (bool: boolean) => {
    const player = game.getPlayers().get(uuid)
    if (player) player.move.d = bool
  })
  socket.on("boomerang", (degrees: number) => {
    const player = game.getPlayers().get(uuid)
    if (!player || player.boomerangs.length > 0) {
      return
    }
    player.boomerangs.push(createBoomerang(player, degrees))
  })

  socket.on("disconnect", () => {
    console.log('address user disconnected', uuid)
    const player = game.getPlayers().get(uuid)
    if (player) player.disconnected = Date.now()
  })
})

const emitPlayers = () => io.emit("players", game.getPlayers().list())


const PORT: number = Number.parseInt(process.env.PORT ?? "80")
server.listen(PORT, () => {
  console.log(`listening on ${PORT}`)
})