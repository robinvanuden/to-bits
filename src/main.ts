import {createServer} from "http"
import type {Express} from "express"
import express from "express"
import {Server, Socket} from "socket.io"
import {Boomerang, Player} from "./types/player"
import {v4} from "uuid"
import {MAP, VOID} from "./controllerMap"
import {Tile} from "./types/map"
import {createPlayer, respawnPlayer} from "./controllerPlayer"
import {createBoomerang} from "./controllerBoomerang"

const HOST: string = process.env.HOST ?? "0.0.0.0"
const PORT: number = Number.parseInt(process.env.PORT ?? "3000")

const app: Express = express()
const server = createServer(app)

const io = new Server(server)

app.use("/", express.static("public"))

const VERSION = process.env.npm_package_version
console.log("ToBits: v" + VERSION)


const TICKS = 50

let players: Player[] = []

io.on('connection', (socket) => {
  const address = socket?.handshake?.address ?? ""
  if (address === "") {
    return
  }
  if (players.find(p => p.connected && p.address === address) != null) {
    // Disconnect double users
    socket.disconnect(true)
    return
  }
  socket.emit("version", VERSION)
  let id: string = ""
  let continue_player = players.find(p => !p.connected && p.address === address)
  if (continue_player == null) {
    const SPAWN_TILE = randomSpawn()
    id = v4()
    console.log('address user connected', id)
    players.push(createPlayer(SPAWN_TILE, id, address))
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
    const player = players.find(p => p.id === id)
    if (player) player.direction.l = bool
  })
  socket.on("move.right", (bool: boolean) => {
    const player = players.find(p => p.id === id)
    if (player) player.direction.r = bool
  })
  socket.on("move.up", (bool: boolean) => {
    const player = players.find(p => p.id === id)
    if (player) player.direction.u = bool
  })
  socket.on("move.down", (bool: boolean) => {
    const player = players.find(p => p.id === id)
    if (player) player.direction.d = bool
  })
  socket.on("boomerang", (degrees: number) => {
    const player = players.find(p => p.id === id)
    player.boomerangs.push(createBoomerang(player, degrees))
  })

  socket.on("disconnect", () => {
    console.log('address user disconnected', id)
    const player = players.find(p => p.id === id) ?? null
    if (!player) {
      return
    }
    player.connected = false
    setTimeout(() => {
      if (players.find(p => p.id === id && !p.connected) != null) players = players.filter(p => p.id !== id)
    }, 5000)
  })
})

const randomSpawn = () => {
  const spawns = MAP.filter(t => t.t === 9)
  const index = Math.round((spawns.length - 1) * Math.random())
  return spawns[index]
}

const emitMap = (socket: Socket) => socket.emit("map", MAP)

const emitPlayers = () => io.emit("players", players.filter(p => p.alive))
const killPlayer = (player: Player) => {
  const SPAWN_TILE = randomSpawn()
  player.alive = false
  player.y = 0
  setTimeout(() => respawnPlayer(player, SPAWN_TILE), 3000)
}

const isColliding = (p: Player, t: Tile): boolean => {
  return p.x < t.x + t.w && p.x + p.w > t.x && p.y < t.y + t.h && p.y + p.h > t.y
}

const isCollidingWithMap = (player: Player): boolean => {
  for (const tile of MAP.filter(tile => tile.t === 1)) {
    if (isColliding(player, tile)) {
      return true
    }
  }
  return false
}

const isBroke = (b: Boomerang, t: Tile): boolean => {
  return b.x < t.x + t.w && b.x + b.w > t.x && b.y < t.y + t.h && b.y + b.h > t.y
}

const isBrokeOnMap = (boomerang: Boomerang): boolean => {
  for (const tile of MAP.filter(tile => tile.t === 1)) {
    if (isBroke(boomerang, tile)) {
      return true
    }
  }
  return false
}

const isWalkingOn = (p: Player, t: Tile): boolean => {
  // +1 checks 1 row of pixels below player
  return p.x < t.x + t.w && p.x + p.w > t.x && p.y < t.y + t.h && p.y + p.h + 1 > t.y
}

const isWalkingOnMap = (player: Player): boolean => {
  for (const tile of MAP.filter(tile => tile.t === 1)) {
    if (isWalkingOn(player, tile)) {
      return true
    }
  }
  return false
}

const isCaughtBoomerang = (p: Player, b: Boomerang): boolean => {
  return p.x < b.x + b.w && p.x + p.w > b.x && p.y < b.y + b.h && p.y + p.h > b.y
}

const checkPlayerPosition = (delta: number) => {
  for (const player of players) {
    player.vy += player.gravity * delta
    if (player.direction.l) {
      player.x -= player.speed_walk
      if (isCollidingWithMap(player)) player.x += player.speed_walk
    }
    if (player.direction.r) {
      player.x += player.speed_walk
      if (isCollidingWithMap(player)) player.x -= player.speed_walk
    }
    if (player.direction.u && player.canJump) {
      player.vy -= player.speed_jump
      player.canJump = false
    }
    player.y += player.vy

    if (isCollidingWithMap(player)) {
      player.y -= player.vy
      player.vy = 0
    }
    if (isWalkingOnMap(player)) {
      player.canJump = true
    }
    if (player.y > VOID && player.alive) {
      killPlayer(player)
    }
    for (const boomerang of player.boomerangs) {
      boomerang.vx += boomerang.x < player.x ? -1 : 1
      boomerang.vy += boomerang.y < player.y ? -1 : 1
      boomerang.x -= boomerang.vx
      boomerang.y -= boomerang.vy

      if (isCaughtBoomerang(player, boomerang)) {
        player.boomerangs = player.boomerangs.filter(b => b.id !== boomerang.id)
      }

      if (isBrokeOnMap(boomerang)) {
        player.boomerangs = player.boomerangs.filter(b => b.id !== boomerang.id)
      }
    }
  }
  emitPlayers()
}

const tick = (delta: number) => {
  checkPlayerPosition(delta)
}

server.listen(PORT, HOST, () => {
  console.log(`listening on http://localhost:${PORT}`)
  console.log(`listening on http://${HOST}:${PORT}`)

  let updated = Date.now()
  setInterval(() => {
    let now = Date.now()
    tick(now - updated)
    updated = now
  }, 1000 / TICKS)
})