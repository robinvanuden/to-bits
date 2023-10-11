(() => {
  const socket = io({
    "transports": ['websocket'],
    upgrade: true,
    ackTimeout: 2000
  });

  let BLOCKS = {}

  let VERSION = ""
  let ID = ""
  let DEBUG = false
  let RUNNING = false

  const canvas = document.getElementById("playground")
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  window.addEventListener("resize", () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
  })

  const ctx = canvas.getContext("2d")
  ctx.imageSmoothingEnabled = false

  let MAP = []
  let PLAYERS = []

  socket.on("connect", () => {
    canvas.classList.remove("loading")
  })

  socket.on("disconnect", () => {
    RUNNING = false
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

    if (pressed && key === ";") {
      DEBUG = !DEBUG
    }
  }

  const getRotationDegrees = (x1, y1, x2, y2) => {
    const deltaX = x2 - x1;
    const deltaY = y2 - y1;
    const radians = Math.atan2(deltaY, deltaX);
    const degrees = (radians * 180) / Math.PI;
    return (degrees + 360) % 360;
  };

  const onMouseRelease = (ev) => {
    const you = PLAYERS.find(p => p.id === ID)
    if (!you) {
      return
    }
    socket.emit("boomerang", getRotationDegrees(window.innerWidth / 2, window.innerHeight / 2, ev.clientX, ev.clientY))
  }

  const loadAsset = (name) => {
    if (BLOCKS.hasOwnProperty(name)) {
      return BLOCKS[name]
    }
    switch (name) {
      case "grass":
        const image = new Image()
        image.style.imageRendering = "pixelated"
        image.src = "/img/grass.png"
        BLOCKS[name] = image
        return image;
    }
  }

  const drawMap = () => {
    let cx;
    let cy;

    const playerToFocus = PLAYERS.find(player => player.id === ID)
    if (playerToFocus) {
      cx = (playerToFocus.x + playerToFocus.w * .5) - canvas.width / 2
      cy = (playerToFocus.y + playerToFocus.h * .5) - canvas.height / 2
    } else {
      cx = canvas.width / 2
      cy = canvas.height / 2
    }
    for (const tile of MAP.filter(tile => tile.t === 1)) {
      ctx.fillStyle = tile.c;
      if (tile.i !== undefined) {
        ctx.drawImage(loadAsset(tile.i), tile.x - cx, tile.y - cy, tile.w, tile.h)
      } else {
        ctx.fillRect(tile.x - cx, tile.y - cy, tile.w, tile.h)
      }
    }
    for (const player of PLAYERS.filter(p => p.died === undefined)) {
      ctx.textAlign = "center"
      ctx.fillStyle = "#000"
      ctx.font = "12px Arial"
      ctx.fillText(player.name, player.x - cx + player.w * .5, player.y - cy - 5)
      ctx.fillStyle = player.color
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
    if (you.died === undefined) {
      return
    }
    const now = Date.now()
    ctx.fillStyle = "rgba(0,0,0,0.8)"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.textAlign = "center"
    ctx.fillStyle = "#FFF"
    ctx.font = "50px Arial"
    ctx.fillText("YOU DIED", canvas.width / 2, canvas.height / 2)

    ctx.font = "20px Arial"
    ctx.fillText("Respawn in: " + Math.round(((you.died + 5000) - now) / 1000), canvas.width / 2, (canvas.height / 2) + 30)
  }
  const drawLoading = () => {
    if (RUNNING) {
      return
    }
    ctx.fillStyle = "#FFF"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.textAlign = "center"
    ctx.fillStyle = "#000"
    ctx.font = "50px Arial"
    ctx.fillText("LOADING", canvas.width / 2, canvas.height / 2)
  }

  const drawPlayerList = () => {
    let y = 20
    for (const player of PLAYERS) {
      ctx.font = "20px Arial"
      ctx.textAlign = "right"
      ctx.fillStyle = player.color
      ctx.fillText(player.name, canvas.width - 5, y)
      y += 20
    }
  }


  const drawDebug = (delta) => {
    const you = PLAYERS.find(p => p.id === ID)

    ctx.font = "10px Arial"
    ctx.fillStyle = "black"
    ctx.textAlign = "left"
    let x = 2
    let y = 10
    ctx.fillText("delta: " + delta, x, y)
    if (you == null || you.died !== undefined) {
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
    ctx.fillText("arial: " + you.arial, x, y)
    y += 10
    ctx.fillText("alive: " + you.died !== undefined, x, y)

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
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawMap()
    drawPlayerList()
    drawMessage()
    drawLoading()
    if (DEBUG) drawDebug(delta)
    lastRender = timestamp
    if (RUNNING) window.requestAnimationFrame(tick)
  }
  document.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener("keydown", events => keyEvent(events, true))
  window.addEventListener("keyup", events => keyEvent(events, false))
  canvas.addEventListener("mouseup", onMouseRelease)
})()