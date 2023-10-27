import {io} from "socket.io-client"
import MapController from "./controller/map"
import ImageController from "./controller/image"

(() => {

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

  let VERSION = ""

  const ratio = window.devicePixelRatio || 1

  const c = document.getElementById("playground") as HTMLCanvasElement

  const imageController = new ImageController(host)

  const mapController = new MapController(c, ratio, socket.id, imageController)

  c.width = window.innerWidth * ratio
  c.height = window.innerHeight * ratio

  window.addEventListener("resize", () => {
    c.width = window.innerWidth * ratio
    c.height = window.innerHeight * ratio
  })

  socket.on("connect", () => mapController.setID(socket.id))

  socket.on("disconnect", () => mapController.setLoading(true))

  socket.on("map", map => {
    mapController.setMap(map)
    mapController.setLoading(false)
  })

  socket.on("players", mapController.setPlayers)

  socket.on("boomerangs", mapController.setBoomerangs)

  socket.on("version", version => {
    if (VERSION === "") {
      VERSION = version
      mapController.setLoading(true)
    } else if (VERSION !== version) {
      window.location.reload()
    }
  })

  const keyEvent = (ev: KeyboardEvent, pressed: boolean) => {
    const you = mapController.you()
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
      mapController.toggleDebug()
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
    const you = mapController.you()
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


  document.addEventListener('contextmenu', e => e.preventDefault())
  window.addEventListener("keydown", events => keyEvent(events, true))
  window.addEventListener("keyup", events => keyEvent(events, false))
  window.addEventListener("mouseup", onMouseRelease)
})()