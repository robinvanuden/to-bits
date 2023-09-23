const socket = io();

let VERSION = ""
let ID = ""
let DEBUG = true
let RUNNING = false

const canvas = document.getElementById("playground")
canvas.width = window.innerWidth
canvas.height = window.innerHeight

const COLOR_TILES = "#606c79"
const COLOR_TEXT = "#000"

const ctx = canvas.getContext("2d")

let MAP = {
  t: [],
  w: 0,
  h: 0
}
let PLAYERS = []

socket.on("connect", () => {
  canvas.classList.remove("loading")
  RUNNING = true
})

socket.on("disconnect", () => canvas.classList.add("loading"))

socket.on("map", map => {
  MAP = map
  RUNNING = true
  window.requestAnimationFrame(tick)
})

socket.on("players", players => PLAYERS = players)

socket.on("me", id => ID = id)

socket.on("version", version => {
  if (VERSION === "") {
    VERSION = version
    document.title = "To Bits v" + VERSION
  } else if (VERSION !== version) {
    window.location.reload()
  }
})

const drawMap = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  let cx = 0;
  let cy = 0;

  const playerToFocus = PLAYERS.find(player => player.id === ID)
  if (playerToFocus) {
    cx = playerToFocus.x - canvas.width / 2
    cy = playerToFocus.y - canvas.height / 2
  }
  for (const tile of MAP.t.filter(tile => tile.t === 1)) {
    ctx.fillStyle = COLOR_TILES;
    ctx.fillRect(tile.x - cx, tile.y - cy, tile.w, tile.h)
  }
  for (const player of PLAYERS) {
    ctx.textAlign = "center"
    ctx.fillStyle = COLOR_TEXT
    ctx.font = "12px Arial"
    ctx.fillText(player.name, player.x - cx + player.w * .5, player.y - cy - 5)
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x - cx, player.y - cy, player.w, player.h)
  }
}

const drawDebug = (delta) => {
  const you = PLAYERS.find(p => p.id === ID)

  ctx.font = "10px Arial"
  ctx.fillStyle = "black"
  ctx.textAlign = "left"
  let y = 10
  ctx.fillText("delta: " + delta, 0, y)
  if (you == null) {
    return
  }
  y += 10
  ctx.fillText("x: " + you.x, 0, y)
  y += 10
  ctx.fillText("y: " + you.y, 0, y)
  y += 10
  ctx.fillText("vx: " + you.vx, 0, y)
  y += 10
  ctx.fillText("vy: " + you.vy, 0, y)
}

const keyEvent = (ev, pressed) => {
  console.log(ev)
  const key = ev.key.toLowerCase()
  if (key === "d") {
    socket.emit("move.right", pressed)
  } else if (key === "a") {
    socket.emit("move.left", pressed)
  }
  if (key === "w") {
    socket.emit("move.up", pressed)
  } else if (key === "s") {
    socket.emit("move.down", pressed)
  }

  if (pressed && key === "3") {
    DEBUG = !DEBUG
  }
}

window.addEventListener("keydown", events => keyEvent(events, true))
window.addEventListener("keyup", events => keyEvent(events, false))

let lastRender = Date.now()
const tick = (timestamp) => {
  const delta = timestamp - lastRender
  drawMap()
  if (DEBUG) drawDebug(delta)
  lastRender = timestamp
  if (RUNNING) window.requestAnimationFrame(tick)
}