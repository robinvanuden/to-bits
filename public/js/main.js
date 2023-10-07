const socket = io();

let VERSION = ""
let ID = ""
let DEBUG = true
let RUNNING = false

const body = document.querySelector("body")
const canvas = document.getElementById("playground")
canvas.width = window.innerWidth
canvas.height = window.innerHeight

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
})

const ctx = canvas.getContext("2d")

let MAP = []
let PLAYERS = []

socket.on("connect", () => {
  canvas.classList.remove("loading")
})

socket.on("disconnect", () => {
  RUNNING = false
  canvas.classList.add("loading")
})

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
  for (const tile of MAP.filter(tile => tile.t === 1)) {
    ctx.fillStyle = tile.c;
    ctx.fillRect(tile.x - cx, tile.y - cy, tile.w, tile.h)
  }
  for (const player of PLAYERS) {
    ctx.textAlign = "center"
    ctx.fillStyle = player.color
    ctx.font = "12px DotGothic16"
    ctx.fillText(player.name, player.x - cx + player.w * .5, player.y - cy - 5)
    ctx.fillRect(player.x - cx, player.y - cy, player.w, player.h)

    for (const boomerang of player.boomerangs) {
      ctx.fillRect(boomerang.x - cx, boomerang.y - cy, boomerang.w, boomerang.h)
    }
  }
}

const drawMessage = () => {
  const you = PLAYERS.find(p => p.id === ID)
  if (!you) {
    return
  }
  if (you.alive) {
    body.classList.remove("dead")
    return
  }
  console.log("dead")
  body.classList.add("dead")
  ctx.textAlign = "center"
  ctx.font = "80px DotGothic16"
  ctx.fillText("You died", canvas.width / 2, canvas.height / 2)
}

const keyEvent = (ev, pressed) => {
  const you = PLAYERS.find(p => p.id === ID)
  if (!you) {
    return
  }
  const key = ev.key.toLowerCase()
  if (key === "d") {
    socket.emit("move.right", pressed)
  } else if (key === "a") {
    socket.emit("move.left", pressed)
  }
  if (key === "w" || key === " ") {
    socket.emit("move.up", pressed)
  }
  if (key === "s") {
    socket.emit("move.down", pressed)
  }

  if (pressed && key === "3") {
    DEBUG = !DEBUG
  }
}

const onMouseClick = (ev) => {
  const you = PLAYERS.find(p => p.id === ID)
  if (!you) {
    return
  }
  const w = window.innerWidth / 2
  const h = window.innerHeight / 2
  const x = ev.clientX
  const y = ev.clientY
  const deltaX = w - x;
  const deltaY = h - y;
  const radius = Math.atan2(deltaY, deltaX)
  let degrees = Math.round(radius * (180 / Math.PI))
  if (degrees < 0) degrees = (degrees + 360) % 360
  socket.emit("boomerang", degrees)
}


const drawDebug = (delta) => {
  const you = PLAYERS.find(p => p.id === ID)

  ctx.font = "10px Arial"
  ctx.fillStyle = "black"
  ctx.textAlign = "left"
  let x = 2
  let y = 10
  ctx.fillText("delta: " + delta, x, y)
  if (you == null || !you.alive) {
    return
  }
  y += 10
  ctx.fillText("name: " + you.name, x, y)
  y += 10
  ctx.fillText("x: " + you.x, x, y)
  y += 10
  ctx.fillText("y: " + you.y, x, y)
  y += 10
  ctx.fillText("vx: " + you.vx, x, y)
  y += 10
  ctx.fillText("vy: " + you.vy, x, y)
  y += 10
  ctx.fillText("canJump: " + you.canJump, x, y)
  y += 10
  ctx.fillText("alive: " + you.alive, x, y)

  const boomerang = you.boomerangs[0]
  if (!boomerang) {
    return;
  }
  y += 10
  ctx.fillText("x: " + boomerang.x, x, y)
  y += 10
  ctx.fillText("y: " + boomerang.y, x, y)
  y += 10
  ctx.fillText("vx: " + boomerang.vx, x, y)
  y += 10
  ctx.fillText("vy: " + boomerang.vy, x, y)
}

let lastRender = Date.now()
const tick = (timestamp) => {
  const delta = timestamp - lastRender
  drawMap()
  if (DEBUG) drawDebug(delta)
  drawMessage()
  lastRender = timestamp
  if (RUNNING) window.requestAnimationFrame(tick)
}


window.addEventListener("keydown", events => keyEvent(events, true))
window.addEventListener("keyup", events => keyEvent(events, false))
canvas.addEventListener("mousedown", onMouseClick)