(() => {
  const socket = io({
    "transports": ['websocket'],
    upgrade: true,
    ackTimeout: 2000
  });

  const IMAGE_BLOCKS = new Image()
  IMAGE_BLOCKS.src = "/img/blocks.jpg"
  IMAGE_BLOCKS.style.imageRendering = "pixelated"

  const IMAGE_CHARACTER = new Image()
  IMAGE_CHARACTER.src = "/img/character.png"
  IMAGE_CHARACTER.style.imageRendering = "pixelated"

  let VERSION = ""
  let ID = ""
  let SHOW_DEBUG = false
  let SHOW_PLAYERS = false
  let RUNNING = false

  const ratio = window.devicePixelRatio || 1

  const c = document.getElementById("playground")

  c.width = window.innerWidth * ratio
  c.height = window.innerHeight * ratio

  window.addEventListener("resize", () => {
    c.width = window.innerWidth * ratio
    c.height = window.innerHeight * ratio
  })

  c.ctx = c.getContext("2d")
  c.ctx.imageSmoothingEnabled = false

  let MAP = []
  let PLAYERS = []

  socket.on("connect", () => {
    c.classList.remove("loading")
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
      SHOW_DEBUG = !SHOW_DEBUG
    }

    if (pressed && key === "tab") {
      SHOW_PLAYERS = !SHOW_PLAYERS
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
    socket.emit("boomerang", getRotationDegrees(
      window.innerWidth / 2 * ratio,
      window.innerHeight / 2 * ratio,
      ev.clientX * ratio,
      ev.clientY * ratio
    ))
  }

  const drawMap = () => {
    let cx;
    let cy;

    const playerToFocus = PLAYERS.find(player => player.id === ID)
    if (playerToFocus) {
      cx = (playerToFocus.x * ratio + playerToFocus.w * ratio * .5) - c.width / 2
      cy = (playerToFocus.y * ratio + playerToFocus.h * ratio * .5) - c.height / 2
    } else {
      cx = c.width / 2
      cy = c.height / 2
    }
    for (const tile of MAP.filter(tile => tile.t === 1)) {
      c.ctx.fillStyle = tile.c;
      let bx = 0, by = 0;
      switch (tile.i) {
        case "grass":
          bx = 16 * .5
          break;
        case "dirt":
          bx = 32 * .5
          break;
      }
      c.ctx.drawImage(
        IMAGE_BLOCKS,
        bx,
        by,
        8,
        8,
        tile.x * ratio - cx,
        tile.y * ratio - cy,
        tile.w * ratio,
        tile.h * ratio
      )
    }
    for (const player of PLAYERS.filter(p => p.died === undefined)) {
      const player_w = player.w * ratio
      const player_h = player.h * ratio
      const player_x = player.x * ratio
      const player_y = player.y * ratio
      c.ctx.textAlign = "center"
      c.ctx.fillStyle = "#FFF"
      c.ctx.font = `${14 * ratio}px FiveFontsatFreddy`
      c.ctx.fillText(player.name, player_x - cx + player_w * .5, player_y - cy + 2)
      c.ctx.fillStyle = player.color
      // c.ctx.fillRect(player_x - cx, player_y - cy, player_w, player_h)

      c.ctx.drawImage(
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

      for (const boomerang of player.boomerangs) {
        c.ctx.fillRect(
          boomerang.x * ratio - cx,
          boomerang.y * ratio - cy,
          boomerang.w * ratio,
          boomerang.h * ratio
        )
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
    c.ctx.fillStyle = "rgba(0,0,0,0.8)"
    c.ctx.fillRect(0, 0, c.width, c.height)
    c.ctx.textAlign = "center"
    c.ctx.fillStyle = "#FFF"
    c.ctx.font = `${50 * ratio}px FiveFontsatFreddy`
    c.ctx.fillText("YOU DIED", c.width / 2, c.height / 2)

    c.ctx.font = `${30 * ratio}px FiveFontsatFreddy`
    c.ctx.fillText("Respawn in: " + Math.round(((you.died + 5000) - now) / 1000), c.width / 2, (c.height / 2) + (30 * ratio))

  }
  const drawLoading = () => {
    if (RUNNING) {
      return
    }
    c.ctx.fillStyle = "#1d1d1d"
    c.ctx.fillRect(0, 0, c.width, c.height)
    c.ctx.textAlign = "center"
    c.ctx.fillStyle = "#f3f3f3"
    c.ctx.font = `${50 * ratio}px FiveFontsatFreddy`
    c.ctx.fillText("LOADING", c.width / 2, c.height / 2)
  }

  const drawPlayerList = () => {
    const side_bar = 200 * ratio
    c.ctx.fillStyle = "#1d1d1d"
    c.ctx.fillRect(c.width - 200, 0, 200, c.height)
    let y = 20 * ratio
    for (const player of PLAYERS) {
      c.ctx.font = `${16 * ratio}px FiveFontsatFreddy`
      c.ctx.textAlign = "left"
      c.ctx.fillStyle = player.color
      c.ctx.fillText(player.name, c.width - side_bar, y)
      y += side_bar * ratio
    }
  }


  const drawDebug = (delta) => {
    const you = PLAYERS.find(p => p.id === ID)

    c.ctx.font = `${10 * ratio}px FiveFontsatFreddy`
    c.ctx.fillStyle = "black"
    c.ctx.textAlign = "left"
    let x = 2 * ratio
    let y = 20 * ratio
    c.ctx.fillText("delta: " + delta, x, y)
    if (you == null || you.died !== undefined) {
      return
    }
    y += 10 * ratio
    c.ctx.fillText("name: " + you.name, x, y)
    y += 10 * ratio
    c.ctx.fillText("x: " + you.x, x, y)
    y += 10 * ratio
    c.ctx.fillText("y: " + you.y, x, y)
    y += 10 * ratio
    c.ctx.fillText("vx: " + you.vx, x, y)
    y += 10 * ratio
    c.ctx.fillText("vy: " + you.vy, x, y)
    y += 10 * ratio
    c.ctx.fillText("jumping: " + you.jumping, x, y)
    y += 10 * ratio
    c.ctx.fillText("alive: " + you.died !== undefined, x, y)
    y += 10 * ratio
    c.ctx.fillText("l.u: " + you.look.u, x, y)
    y += 10 * ratio
    c.ctx.fillText("l.d: " + you.look.d, x, y)
    y += 10 * ratio
    c.ctx.fillText("l.l: " + you.look.l, x, y)
    y += 10 * ratio
    c.ctx.fillText("l.r: " + you.look.r, x, y)

    const boomerang = you.boomerangs[0]
    if (!boomerang) {
      return;
    }
    y += 10 * ratio
    c.ctx.fillText("x: " + boomerang.x, x, y)
    y += 10 * ratio
    c.ctx.fillText("y: " + boomerang.y, x, y)
    y += 10 * ratio
    c.ctx.fillText("vx: " + boomerang.vx, x, y)
    y += 10 * ratio
    c.ctx.fillText("vy: " + boomerang.vy, x, y)
  }

  let lastRender = Date.now()
  const tick = (timestamp) => {
    const delta = timestamp - lastRender
    c.ctx.clearRect(0, 0, c.width, c.height);
    drawMap()
    if (SHOW_PLAYERS) drawPlayerList()
    drawMessage()
    drawLoading()
    if (SHOW_DEBUG) drawDebug(delta)
    lastRender = timestamp
    if (RUNNING) window.requestAnimationFrame(tick)
  }
  document.addEventListener('contextmenu', e => e.preventDefault());
  window.addEventListener("keydown", events => keyEvent(events, true))
  window.addEventListener("keyup", events => keyEvent(events, false))
  c.addEventListener("mouseup", onMouseRelease)
})()