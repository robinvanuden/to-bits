import {io} from "socket.io-client"
import PlayerModel from "./model/PlayerModel"
import TileModel from "./model/TileModel"
import BoomerangModel from "./model/BoomerangModel"

(() => {
  const FONT = "FiveFontsatFreddy"

  const host = new URL(location.toString())
  const secure = (location.protocol === "wss:" || location.protocol === "https:")
  host.protocol = secure ? "https:" : "http:"
  host.pathname = ""
  const socket = io({
    "transports": ['websocket'],
    upgrade: true,
    ackTimeout: 2000,
    autoConnect: true,
    secure: secure,
    reconnection: true,
    timeout: 10000
  })

  const IMAGE_BLOCKS = new Image()
  IMAGE_BLOCKS.src = host.toString() + "img/blocks.jpg"
  IMAGE_BLOCKS.style.imageRendering = "pixelated"

  const IMAGE_CHARACTER = new Image()
  IMAGE_CHARACTER.src = host.toString() + "img/character.png"
  IMAGE_CHARACTER.style.imageRendering = "pixelated"

  let VERSION = ""
  let ID = socket.id
  let SHOW_DEBUG = false
  let SHOW_PLAYERS = false
  let LOADING = true

  const ratio = window.devicePixelRatio || 1

  const c = document.getElementById("playground") as HTMLCanvasElement

  c.width = window.innerWidth * ratio
  c.height = window.innerHeight * ratio

  window.addEventListener("resize", () => {
    c.width = window.innerWidth * ratio
    c.height = window.innerHeight * ratio
  })

  const ctx = c.getContext("2d") as CanvasRenderingContext2D
  ctx.imageSmoothingEnabled = false

  let MAP = [] as TileModel[]
  let PLAYERS = [] as PlayerModel[]
  let BOOMERANGS = [] as BoomerangModel[]

  socket.on("connect", () => {
    LOADING = true
    ID = socket.id
    console.log("connected", ID)
  })

  socket.on("disconnect", () => {
    LOADING = true
  })

  socket.on("map", map => {
    MAP = map
    LOADING = false
  })

  socket.on("players", players => PLAYERS = players)

  socket.on("boomerangs", boomerangs => BOOMERANGS = boomerangs)

  socket.on("version", version => {
    if (VERSION === "") {
      VERSION = version
      document.title = "To Bits v" + VERSION
      LOADING = true
    } else if (VERSION !== version) {
      window.location.reload()
    }
  })

  const keyEvent = (ev: KeyboardEvent, pressed: boolean) => {
    const you = PLAYERS.find(p => p.i === ID)
    if (!you) {
      return
    }
    const key = ev.key.toLowerCase()
    if (key === "d") {
      socket.emit("move.right", pressed)
    } else if (key === "a") {
      socket.emit("move.left", pressed)
    }
    if (key === "w") {
      socket.emit("move.up", pressed)
    }
    if (key === " ") {
      socket.emit("move.jump", pressed)
    }
    if (key === "s") {
      socket.emit("move.down", pressed)
    }
    if (pressed && key === ";") {
      SHOW_DEBUG = !SHOW_DEBUG
    }
    if (pressed && key === "tab") {
      SHOW_PLAYERS = !SHOW_PLAYERS
    }
  }

  const getRotationDegrees = (x1: number, y1: number, x2: number, y2: number) => {
    const deltaX = x2 - x1
    const deltaY = y2 - y1
    const radians = Math.atan2(deltaY, deltaX)
    const degrees = (radians * 180) / Math.PI
    return (degrees + 360) % 360
  }

  const onMouseRelease = (ev: MouseEvent) => {
    const you = PLAYERS.find(p => p.i === ID)
    if (!you) {
      return
    }
    socket.emit("radius", getRotationDegrees(
      window.innerWidth / 2 * ratio,
      window.innerHeight / 2 * ratio,
      ev.clientX * ratio,
      ev.clientY * ratio
    ))
  }

  const drawMap = () => {
    let cx: number
    let cy: number

    const playerToFocus = PLAYERS.find(player => player.i === ID)
    if (playerToFocus) {
      cx = Math.round((playerToFocus.x * ratio + playerToFocus.w * ratio * .5) - c.width / 2)
      cy = Math.round((playerToFocus.y * ratio + playerToFocus.h * ratio * .5) - c.height / 2)
    } else {
      cx = Math.round(c.width / 2)
      cy = Math.round(c.height / 2)
    }
    for (const tile of MAP.filter(tile => tile.t === 1 || tile.t === 2)) {
      ctx.fillStyle = tile.c
      let bx = 0, by = 0
      switch (tile.i) {
        case "grass":
          bx = 12
          break
        case "dirt":
          bx = 24
          break
      }
      ctx.drawImage(
        IMAGE_BLOCKS,
        bx,
        by,
        12,
        12,
        tile.x * ratio - cx,
        tile.y * ratio - cy,
        tile.w * ratio,
        tile.h * ratio
      )
    }
    for (const player of PLAYERS.filter(p => p.d === undefined)) {
      const player_w = player.w * ratio
      const player_h = player.h * ratio
      const player_x = player.x * ratio
      const player_y = player.y * ratio
      ctx.textAlign = "center"
      ctx.fillStyle = "#FFF"
      ctx.font = `${12 * ratio}px ${FONT}`
      ctx.fillText(player.n, player_x - cx + player_w * .5, player_y - cy + 2)
      ctx.fillStyle = player.c
      ctx.fillRect(player_x - cx, player_y - cy, player_w, player_h)

      ctx.drawImage(
        IMAGE_CHARACTER,
        2,
        0,
        12,
        16,
        player_x - cx,
        player_y - cy,
        player_w,
        player_h
      )
    }
    for (const boomerang of BOOMERANGS) {
      ctx.fillStyle = boomerang.color
      ctx.fillRect(
        boomerang.x * ratio - cx,
        boomerang.y * ratio - cy,
        boomerang.w * ratio,
        boomerang.h * ratio
      )
    }
  }

  const drawMessage = () => {
    const you = PLAYERS.find(p => p.i === ID)
    if (!you) {
      return
    }
    if (you.d === undefined) {
      return
    }
    const now = Date.now()
    ctx.fillStyle = "rgba(0,0,0,0.8)"
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.textAlign = "center"
    ctx.fillStyle = "#FFF"
    ctx.font = `${50 * ratio}px ${FONT}`
    ctx.fillText("YOU DIED", c.width / 2, c.height / 2)

    ctx.font = `${30 * ratio}px ${FONT}`
    ctx.fillText("Respawn in: " + Math.round(((you.d + 5000) - now) / 1000), c.width / 2, (c.height / 2) + (30 * ratio))

  }
  const drawLoading = () => {
    ctx.fillStyle = "#1d1d1d"
    ctx.fillRect(0, 0, c.width, c.height)
    ctx.textAlign = "center"
    ctx.fillStyle = "#f3f3f3"
    ctx.font = `${50 * ratio}px ${FONT}`
    ctx.fillText("LOADING", c.width / 2, c.height / 2)
  }

  const drawPlayerList = () => {
    const side_bar = 200 * ratio
    ctx.fillStyle = "#1d1d1d"
    ctx.fillRect(c.width - 200, 0, 200, c.height)
    let y = 20 * ratio
    for (const player of PLAYERS) {
      ctx.font = `${16 * ratio}px ${FONT}`
      ctx.textAlign = "left"
      ctx.fillStyle = player.c
      ctx.fillText(player.n, c.width - side_bar, y)
      y += side_bar * ratio
    }
  }


  const drawDebug = (delta: number) => {
    const you = PLAYERS.find(p => p.i === ID)

    ctx.font = `${10 * ratio}px ${FONT}`
    ctx.fillStyle = "black"
    ctx.textAlign = "left"
    let x = 2 * ratio
    let y = 20 * ratio
    ctx.fillText("delta: " + delta, x, y)
    if (you == null || you.d !== undefined) {
      return
    }
    y += 10 * ratio
    ctx.fillText("name: " + you.n, x, y)
    y += 10 * ratio
    ctx.fillText("x: " + you.x, x, y)
    y += 10 * ratio
    ctx.fillText("y: " + you.y, x, y)
    y += 10 * ratio
    ctx.fillText("vx: " + you.vx, x, y)
    y += 10 * ratio
    ctx.fillText("vy: " + you.vy, x, y)
    y += 10 * ratio
    ctx.fillText("falling: " + (you.vy !== 0) ? "true" : "false", x, y)
    y += 10 * ratio
    ctx.fillText("alive: " + you.d !== undefined ? "true" : "false", x, y)
    y += 10 * ratio
    ctx.fillText("l.u: " + you.l.u, x, y)
    y += 10 * ratio
    ctx.fillText("l.d: " + you.l.d, x, y)
    y += 10 * ratio
    ctx.fillText("l.l: " + you.l.l, x, y)
    y += 10 * ratio
    ctx.fillText("l.r: " + you.l.r, x, y)

    const boomerang = BOOMERANGS.find(b => b.player === you.i)
    if (!boomerang) {
      return
    }
    y += 10 * ratio
    ctx.fillText("x: " + boomerang.x, x, y)
    y += 10 * ratio
    ctx.fillText("y: " + boomerang.y, x, y)
    y += 10 * ratio
    ctx.fillText("vx: " + boomerang.vx, x, y)
    y += 10 * ratio
    ctx.fillText("vy: " + boomerang.vy, x, y)
  }

  let lastRender = Date.now()
  const tick = (timestamp: number) => {
    const delta = timestamp - lastRender
    ctx.clearRect(0, 0, c.width, c.height)
    drawMap()
    if (SHOW_PLAYERS) drawPlayerList()
    drawMessage()
    if (LOADING) drawLoading()
    if (SHOW_DEBUG) drawDebug(delta)
    lastRender = timestamp
    window.requestAnimationFrame(tick)
  }

  window.requestAnimationFrame(tick)
  document.addEventListener('contextmenu', e => e.preventDefault())
  window.addEventListener("keydown", events => keyEvent(events, true))
  window.addEventListener("keyup", events => keyEvent(events, false))
  c.addEventListener("mouseup", onMouseRelease)
})()