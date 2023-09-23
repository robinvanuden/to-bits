import {createServer} from "http"
import type {Express} from "express"
import express from "express"
import {Server, Socket} from "socket.io"
import {Player} from "./types/player"
import {v4} from "uuid"
import {MAP} from "./controllerMap"
import {Tile} from "./types/map"
import {createPlayer} from "./controllerPlayer"

const PORT = process.env.PORT ?? 3000

const app: Express = express()
const server = createServer(app)

const io = new Server(server)

app.use("/", express.static("public"))

const VERSION = process.env.npm_package_version
console.log("ToBits: v" + VERSION)

// 0: Air
// 1: Ground
// 9: Spawn

const GRAVITY = 0.00982
const TICKS = 30
const SPEED = 3
const SPEED_JUMP = 7

let PLAYERS: Player[] = []

io.on('connection', (socket) => {
  const address = socket?.handshake?.address ?? ""
  if (address === "") {
    return
  }
  if (PLAYERS.find(p => p.connected && p.address === address) != null) {
    // Disconnect double users
    socket.disconnect(true)
    return
  }
  socket.emit("version", VERSION)
  let id
  let continue_player = PLAYERS.find(p => !p.connected && p.address === address)
  if (continue_player == null) {
    const SPAWN_TILE = MAP.t.find(t => t.t === 9)
    id = v4()
    console.log('address user connected', id)
    PLAYERS.push(createPlayer(SPAWN_TILE, id, address))
  } else {
    id = continue_player.id
    continue_player.connected = true
    continue_player.direction = {
      u: false,
      d: false,
      l: false,
      r: false
    }
  }
  socket.emit("me", id)
  emitMap(socket)
  emitPlayers()


  socket.on("move.left", (bool: boolean) => {
    const player = PLAYERS.find(p => p.id === id) ?? null
    if (player != null) player.direction.l = bool
  })
  socket.on("move.right", (bool: boolean) => {
    const player = PLAYERS.find(p => p.id === id) ?? null
    if (player != null) player.direction.r = bool
  })
  socket.on("move.up", (bool: boolean) => {
    const player = PLAYERS.find(p => p.id === id) ?? null
    if (player != null) player.direction.u = bool
  })
  socket.on("move.down", (bool: boolean) => {
    const player = PLAYERS.find(p => p.id === id) ?? null
    if (player != null) player.direction.d = bool
  })

  socket.on("disconnect", () => {
    console.log('address user disconnected', id)
    const player = PLAYERS.find(p => p.id === id) ?? null
    if (player == null) {
      return
    }
    player.connected = false
    setTimeout(() => {
      if (PLAYERS.find(p => p.id === id && !p.connected) != null) PLAYERS = PLAYERS.filter(p => p.id !== id)
    }, 5000)
  })
})

server.listen(PORT, () => {
  console.log('listening on http://localhost:3000')
})

const emitMap = (socket: Socket) => {
  socket.emit("map", MAP)
}

const emitPlayers = () => {
  io.emit("players", PLAYERS)
}

const isColliding = (player: Player, tile: Tile): boolean => {
  return player.x < tile.x + tile.w &&
    player.x + player.w > tile.x &&
    player.y < tile.y + tile.h &&
    player.y + player.h > tile.y
}

const isCollidingWithMap = (player: Player): boolean => {
  for (const tile of MAP.t.filter(tile => tile.t === 1)) {
    if (isColliding(player, tile)) {
      return true
    }
  }
  return false
}

const tick = (delta: number) => {
  for (const player of PLAYERS) {
    player.vy += GRAVITY * delta
    if (player.direction.l) {
      player.x -= SPEED
      if (isCollidingWithMap(player)) player.x += SPEED
    }
    if (player.direction.r) {
      player.x += SPEED
      if (isCollidingWithMap(player)) player.x -= SPEED
    }
    if (player.direction.u && player.canJump) {
      player.vy -= SPEED_JUMP
      player.canJump = false
    }
    if (player.direction.d) {
      player.vy += SPEED_JUMP
    }
    player.y += player.vy

    if (isCollidingWithMap(player)) {
      player.y -= player.vy
      player.vy = 0
      player.canJump = true
    }
  }
  emitPlayers()
}

let updated = Date.now()
setInterval(() => {
  let now = Date.now()
  tick(now - updated)
  updated = now
}, 1000 / TICKS)