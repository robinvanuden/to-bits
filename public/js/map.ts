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
        this.images.addImage("tiles"),
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
      const name_y = player_y - cy - this.canvas.size(1)

      this.ctx.font = this.canvas.font(12)
      this.ctx.textAlign = "center"
      this.ctx.fillStyle = "#000"
      const padding = this.canvas.size(3)
      for (let nx = -padding; nx < padding; nx++) {
        for (let ny = -padding; ny < padding + 1; ny++) {
          this.ctx.fillText(player.n, name_x + nx, name_y + ny)
        }
      }

      this.ctx.fillStyle = "#FFF"
      this.ctx.fillText(player.n, name_x, name_y)

      let sx = 1
      if (player.m.l || player.m.r) {
        if (player.a < 10) {
          sx = 17
        } else if (player.a < 20) {
          sx = 1
        } else if (player.a < 30) {
          sx = 33
        } else if (player.a < 40) {
          sx = 1
        } else {
          player.a = 0
        }
        player.a++
      }

      this.ctx.drawImage(
        this.images.addImage("character"),
        sx,
        player.l.l ? 16 : 0,
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
    }
  }
}