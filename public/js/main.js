const socket = io();

let VERSION = ""
let ID = ""
let DEBUG = true
let RUNNING = false

const canvas = document.getElementById("playground")
const ctx = canvas.getContext("2d")

let DATA_MAP = {
  t: [],
  w: 0,
  h: 0
}
let DATA_PLAYERS = []

socket.on("map", map => {
  DATA_MAP = map
  RUNNING = true
})

socket.on("players", players => DATA_PLAYERS = players)

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
  canvas.width = 600
  canvas.height = 600
  ctx.fillStyle = "#606c79";
  for (const tile of DATA_MAP.t) {
    if (tile.t === 1) {
      ctx.fillRect(tile.x, tile.y, tile.w, tile.h)
    }
  }
  ctx.textColor = "green"
  ctx.textAlign = "center"
  for (let player of DATA_PLAYERS) {
    ctx.fillStyle = player.color;
    ctx.fillText(player.name, player.x + player.w * .5, player.y - 5)
    ctx.fillRect(player.x, player.y, player.w, player.h)
  }
}

const drawDebug = (delta) => {
  const you = DATA_PLAYERS.find(p => p.id === ID)

  ctx.textColor = "black"
  ctx.textAlign = "left"
  let y = 10
  ctx.fillText("delta: " + delta, 0, y)
  if (you == null){
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
  window.requestAnimationFrame(tick)
}
window.requestAnimationFrame(tick)