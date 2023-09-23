const socket = io();

let VERSION = ""
let DEBUG = false
let RUNNING = false

const TILE = 26

const canvas = document.getElementById("playground")
const ctx = canvas.getContext("2d")

let DATA_MAP = [[]]
let DATA_PLAYERS = []

socket.on("map", map => {
  DATA_MAP = map
  RUNNING = true
})

socket.on("players", players => {
  DATA_PLAYERS = players
})

socket.on("version", version => {
  if (VERSION === ""){
    VERSION = version
    document.title = "To Bits v" + VERSION
  } else if (VERSION !== version) {
    window.location.reload()
  }
})

const drawMap = () => {
  canvas.width = DATA_MAP.length * TILE
  canvas.height = DATA_MAP[0].length * TILE

  for (let y = 0; y < DATA_MAP.length; y++) {
    for (let x = 0; x < DATA_MAP[y].length; x++) {
      const value = DATA_MAP[y][x]
      ctx.fillStyle = value === 1 ? "#606c79" : "#e8f1f8";
      ctx.fillRect(x * TILE, y * TILE, TILE, TILE)
    }
  }

  for (let player of DATA_PLAYERS) {
    ctx.fillStyle = "#f12323";
    ctx.fillRect(player.x, player.y, TILE, TILE)
  }
}

let lastRender = Date.now()
const tick = (timestamp) => {
  const fps  = timestamp - lastRender
  if (DEBUG) console.log(fps)
  drawMap()

  lastRender = timestamp
  window.requestAnimationFrame(tick)
}

window.requestAnimationFrame(tick)