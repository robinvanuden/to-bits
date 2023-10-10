import {createServer} from "http"
import express from "express"
import {Server, Socket} from "socket.io"
import {Boomerang, Player} from "./types/player"
import {v4, v5} from "uuid"
import {MAP, VOID} from "./controllerMap"
import {Tile} from "./types/map"
import {createPlayer, killPlayer, respawnPlayer} from "./controllerPlayer"
import {createBoomerang} from "./controllerBoomerang"

const app = express()
const server = createServer(app)
const io = new Server(server)

app.use("/", express.static("public"))

const UUID = v4()

const VERSION = process.env.npm_package_version
console.log("ToBits: v" + VERSION)

const TICKS = 50
let DELTA = 0

let players: Player[] = []

app.get("/delta", (_, res) => res.json(DELTA))

io.on('connection', (socket) => {
  const address = socket?.handshake?.address ?? ""
  if (address === "") {
    return
  }
  const uuid = v5(address, UUID)
  if (players.find(p => p.disconnected == undefined && p.id === uuid) != null) {
    // Disconnect double users
    socket.disconnect(true)
    return
  }
  start()
  socket.emit("version", VERSION)
  let continue_player = players.find(p => p.disconnected != undefined && p.id === uuid)
  if (continue_player == null) {
    // New player
    const SPAWN_TILE = randomSpawn()
    console.log('address user connected', uuid)
    players.push(createPlayer(SPAWN_TILE, uuid))
  } else {
    // Reconnect
    continue_player.disconnected = undefined
    continue_player.move = {
      u: false,
      d: false,
      l: false,
      r: false
    }
  }
  socket.emit("me", uuid)
  emitMap(socket)
  emitPlayers()

  socket.on("move.left", (bool: boolean) => {
    const player = players.find(p => p.id === uuid)
    if (player) player.move.l = bool
  })
  socket.on("move.right", (bool: boolean) => {
    const player = players.find(p => p.id === uuid)
    if (player) player.move.r = bool
  })
  socket.on("move.up", (bool: boolean) => {
    const player = players.find(p => p.id === uuid)
    if (player) player.move.u = bool
  })
  socket.on("move.down", (bool: boolean) => {
    const player = players.find(p => p.id === uuid)
    if (player) player.move.d = bool
  })
  socket.on("boomerang", (degrees: number) => {
    const player = players.find(p => p.id === uuid)
    if (!player || player.boomerangs.length > 0) {
      return
    }
    player.boomerangs.push(createBoomerang(player, degrees))
  })

  socket.on("disconnect", () => {
    console.log('address user disconnected', uuid)
    const player = players.find(p => p.id === uuid) ?? null
    if (!player) {
      return
    }
    player.disconnected = Date.now()
  })
})

const randomSpawn = () => {
  const spawns = MAP.filter(t => t.t === 9)
  const index = Math.round((spawns.length - 1) * Math.random())
  return spawns[index]
}

const emitMap = (socket: Socket) => socket.emit("map", MAP)

const emitPlayers = () => io.emit("players", players)

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

const isHitBoomerang = (p: Player, b: Boomerang): boolean => {
  const b2: Boomerang | null = p.boomerangs[0] ?? null
  if (b2 && b2.id === b.id) {
    return false
  }
  return p.x < b.x + b.w && p.x + p.w > b.x && p.y < b.y + b.h && p.y + p.h > b.y
}

const isCaughtBoomerang = (p: Player): boolean => {
  const b: Boomerang | null = p.boomerangs[0] ?? null
  if (b == null || b.thrown + 250 > Date.now()) {
    return false
  }
  return p.x < b.x + b.w && p.x + p.w > b.x && p.y < b.y + b.h && p.y + p.h > b.y
}

const isKilled = (p: Player): boolean => {
  return p.died === undefined && hasDiedConditions(p)
}
const hasDiedConditions = (p: Player): boolean => {
  for (const player of players.filter(p => p.died === undefined)) {
    for (const boomerang of player.boomerangs) {
      if (isHitBoomerang(p, boomerang)) {
        return true
      }
    }
  }
  return p.y > VOID
}

const checkPlayerPosition = (delta: number) => {
  for (const player of players.filter(p => p.died === undefined)) {
    player.vy += player.gravity * delta
    if (player.move.l) {
      player.x -= player.sw
      if (isCollidingWithMap(player)) player.x += player.sw
    }
    if (player.move.r) {
      player.x += player.sw
      if (isCollidingWithMap(player)) player.x -= player.sw
    }
    if (player.move.u && !player.arial) {
      player.vy -= player.sj
      player.arial = true
    }
    player.x += player.vx
    player.y += player.vy

    if (isCollidingWithMap(player)) {
      player.y -= player.vy
      player.vy = 0
    }
    if (isWalkingOnMap(player)) {
      player.arial = false
    }
    if (isKilled(player)) {
      killPlayer(player)
    }
  }
  emitPlayers()
}

const checkBoomerangPosition = () => {
  for (const player of players.filter(p => p.died === undefined)) {
    for (const boomerang of player.boomerangs) {
      boomerang.vx += boomerang.x < (player.x + (player.w * .5)) ? boomerang.gravity : -boomerang.gravity
      boomerang.vy += boomerang.y < (player.y + (player.h * .5)) ? boomerang.gravity : -boomerang.gravity

      boomerang.x += boomerang.vx
      boomerang.y += boomerang.vy

      if (isCaughtBoomerang(player)) {
        player.boomerangs = player.boomerangs.filter(b => b.id !== boomerang.id)
      }
      if (isBrokeOnMap(boomerang)) {
        player.boomerangs = player.boomerangs.filter(b => b.id !== boomerang.id)
      }
    }
  }
}


const checkDisconnectedPlayers = () => {
  let now = Date.now()
  for (const player of players.filter(p => p.disconnected != undefined && (p.disconnected + 10_000) < now)) {
    console.log("Remove player: " + player.id)
    players = players.filter(p => p.id !== player.id)
  }
}


const checkRespawnPlayers = () => {
  let now = Date.now()
  for (const player of players.filter(p => p.died != undefined && (p.died + 5000) < now)) {
    console.log("Respawn player: " + player.id)
    respawnPlayer(player, randomSpawn())
  }
}

const tick = (delta: number) => {
  DELTA = delta
  checkPlayerPosition(delta)
  checkBoomerangPosition()
  checkRespawnPlayers()
  checkDisconnectedPlayers()
}

const start = () => {
  if (players.length > 0) {
    return
  }
  console.log("Started game loop")
  let updated = Date.now()
  const interval = setInterval(() => {
    let now = Date.now()
    tick(now - updated)
    updated = now
    if (players.length <= 0) {
      console.log("Stopped game loop")
      clearInterval(interval)
    }
  }, 1000 / TICKS)
}

const PORT: number = Number.parseInt(process.env.PORT ?? "80")

server.listen(PORT, () => {
  console.log(`listening on ${PORT}`)
})