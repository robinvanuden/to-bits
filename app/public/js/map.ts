import Images from "./images"
import Data from "./data"
import Canvas from "./canvas"

export default class Map {

  images: Images
  data: Data
  canvas: Canvas
  ctx: CanvasRenderingContext2D

  constructor(canvas: Canvas, data: Data, images: Images) {
    this.canvas = canvas
    this.images = images
    this.data = data
    this.ctx = this.canvas.ctx
  }

  you = () => this.data.players().find(p => p.i === this.data.id()) || undefined

  tileWidth = () => this.data.map()[0]?.w || 0
  mapWidth = () => (this.data.map().map(tile => tile.x).sort((a, b) => b - a)[0] || 0) + this.tileWidth()
  mapHeight = () => (this.data.map().map(tile => tile.y).sort((a, b) => b - a)[0] || 0) + this.tileWidth()

  tick = () => {
    let cx: number
    let cy: number

    const playerToFocus = this.you()
    if (playerToFocus && playerToFocus.d == undefined) {
      cx = Math.round((this.canvas.size(playerToFocus.x) + this.canvas.size(playerToFocus.w) * .5) - this.canvas.width() * .5)
      cy = Math.round((this.canvas.size(playerToFocus.y) + this.canvas.size(playerToFocus.h) * .5) - this.canvas.height() * .5)
    } else {
      cx = Math.round((this.canvas.size(this.mapWidth() * .5)) - this.canvas.width() * .5)
      cy = Math.round((this.canvas.size(this.mapHeight() * .5)) - this.canvas.height() * .5)
    }
    console.log(cx, cy)
    for (const tile of this.data.map().filter(tile => tile.wa)) {
      this.ctx.fillStyle = tile.c
      let bx = 0, by = 0
      switch (tile.i) {
        case "wood":
          bx = 48
          break
        case "grass":
          bx = 32
          break
        case "dirt":
          bx = 16
          break
      }
      this.ctx.drawImage(
        this.images.addImage("img/tiles"),
        bx,
        by,
        16,
        16,
        this.canvas.size(tile.x) - cx,
        this.canvas.size(tile.y) - cy,
        this.canvas.size(tile.w),
        this.canvas.size(tile.h)
      )
    }

    for (const power of this.data.power_ups()) {
      if (power) {
        switch (power.t) {
          case "BOMB":
            this.ctx.fillStyle = "#1d1d1e"
            break
          case "RANG":
            this.ctx.fillStyle = "#6c492e"
            break
          case "FIRE":
            this.ctx.fillStyle = "#e87619"
            break
        }
        this.ctx.fillRect(
          this.canvas.size(power.x) - cx,
          this.canvas.size(power.y) - cy,
          this.canvas.size(power.w),
          this.canvas.size(power.h)
        )
      }
    }

    for (const player of this.data.players().filter(p => p.d === undefined)) {
      const player_w = this.canvas.size(player.w)
      const player_h = this.canvas.size(player.h)
      const player_x = this.canvas.size(player.x)
      const player_y = this.canvas.size(player.y)

      const name_x = player_x - cx + player_w * .5
      const name_y = player_y - cy - this.canvas.size(6)

      this.ctx.font = this.canvas.font(1)
      this.ctx.textAlign = "center"
      this.ctx.fillStyle = "#FFF"
      this.ctx.strokeStyle = "#000"
      this.ctx.lineWidth = this.canvas.size(6)
      this.ctx.strokeText(player.n.toLowerCase(), name_x, name_y)
      this.ctx.fillText(player.n.toLowerCase(), name_x, name_y)

      let sx = player.l.r ? 1 : 2
      const image_name = "image/" + player.uid + (player.l.r ? "r" : "l")
      const image = this.images.addImage(image_name)

      this.ctx.drawImage(
        image,
        sx,
        0,
        13,
        16,
        player_x - cx,
        player_y - cy,
        player_w,
        player_h
      )
      for (const boomerang of player.br) {
        this.ctx.fillStyle = boomerang.c
        this.ctx.fillRect(
          this.canvas.size(boomerang.x) - cx,
          this.canvas.size(boomerang.y) - cy,
          this.canvas.size(boomerang.w),
          this.canvas.size(boomerang.h)
        )
      }
      for (const fireball of player.fb) {
        this.ctx.fillStyle = "#000"
        this.ctx.fillRect(
          this.canvas.size(fireball.x) - cx,
          this.canvas.size(fireball.y) - cy,
          this.canvas.size(fireball.w),
          this.canvas.size(fireball.h)
        )
        this.ctx.fillStyle = "#e0511c"
        this.ctx.fillRect(
          this.canvas.size(fireball.x + 2) - cx,
          this.canvas.size(fireball.y + 2) - cy,
          this.canvas.size(fireball.w - 4),
          this.canvas.size(fireball.h - 4)
        )
      }
    }
  }
}