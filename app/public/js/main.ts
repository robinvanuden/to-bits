import {io} from "socket.io-client"
import Map from "./map"
import Images from "./images"
import Data from "./data"
import Hud from "./hud"
import Canvas from "./canvas"

(() => {

  const updateFavicon = () => (document.getElementById("main-icon") as HTMLLinkElement)
    .href = '/favicon.ico?t=' + Date.now()

  const host = new URL(location.toString())
  const secure = (location.protocol === "wss:" || location.protocol === "https:")
  host.protocol = secure ? "https:" : "http:"
  host.pathname = "/"

  const origin = new URL(host)
  origin.pathname = "/game/"

  const socket = io({
    "transports": ['websocket'],
    host: origin.toString(),
    upgrade: true,
    ackTimeout: 2000,
    autoConnect: true,
    secure: secure,
    reconnection: true,
    timeout: 10000,
    forceNew: true
  })

  let BUILD = 0

  const canvas = new Canvas(document.getElementById("playground") as HTMLCanvasElement)

  const data = new Data()

  const images = new Images(host)

  const map = new Map(canvas, data, images)

  const hud = new Hud(canvas, data)

  socket.on("version", version => {
    if (data.version() === "") {
      document.title = `To Bits! v${version}`
      data.setVersion(version)
      hud.setLoading(true)
    }
  })

  socket.on("build", build => {
    if (BUILD === 0) {
      BUILD = build
    } else if (BUILD !== build) {
      window.location.reload()
    }
  })

  socket.on("connect", () => {
    data.setID(socket.id)
    updateFavicon()
  })

  socket.on("disconnect", () => hud.setLoading(true))

  socket.on("nope", () => hud.setNope(true))

  socket.on("map_layer", map_data => {
    data.setMapLayer(map_data)
    hud.setLoading(false)
  })

  socket.on("players", players => {
    data.setPlayers(players)
    for (const player of players) {
      for (let i = 0; i < 2; i++) {
        images.addImage("image/" + player.uid + "r" + i + ".png")
        images.addImage("image/" + player.uid + "l" + i + ".png")
      }
    }
  })

  const keyEvent = (ev: KeyboardEvent, pressed: boolean) => {
    const you = map.you()
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
      hud.toggleDebug()
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
    const you = map.you()
    if (!you) {
      return
    }
    const ratio = canvas.ratio
    socket.emit("radius", getRotationDegrees(
      window.innerWidth / 2 * ratio,
      window.innerHeight / 2 * ratio,
      ev.clientX * ratio,
      ev.clientY * ratio
    ))
  }


  document.addEventListener('contextmenu', e => e.preventDefault())
  window.addEventListener("keydown", events => keyEvent(events, true))
  window.addEventListener("keyup", events => keyEvent(events, false))
  window.addEventListener("mouseup", onMouseRelease)

  updateFavicon()

  let lastRender = Date.now()
  const loop = (timestamp: number) => {
    const delta = timestamp - lastRender
    canvas.clear()
    if (!hud.loading()) map.tick()
    hud.tick(delta)
    lastRender = timestamp
    window.requestAnimationFrame(loop)
  }
  window.requestAnimationFrame(loop)
})()