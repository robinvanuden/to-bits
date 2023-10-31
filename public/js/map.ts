import Images from "./images"
import Data from "./data"
import Canvas from "./canvas"

export default class Map {

  images: Images
  data: Data
  canvas: Canvas
  ctx: CanvasRenderingContext2D

  constructor(canvas: Canvas, images: Images, data: Data) {
    this.canvas = canvas
    this.images = images
    this.data = data
    this.ctx = this.canvas.ctx()
  }

  you = () => this.data.players().find(p => p.i === this.data.id()) || undefined

  drawMap = () => {
    let cx: number
    let cy: number

    const playerToFocus = this.you()
    if (playerToFocus) {
      cx = Math.round((this.canvas.size(playerToFocus.x) + this.canvas.size(playerToFocus.w) * .5) - this.canvas.width() / 2)
      cy = Math.round((this.canvas.size(playerToFocus.y) + this.canvas.size(playerToFocus.h) * .5) - this.canvas.height() / 2)
    } else {
      cx = Math.round(this.canvas.width() / 2)
      cy = Math.round(this.canvas.height() / 2)
    }
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
      const padding = 5
      for (let nx = -padding; nx < padding; nx++) {
        for (let ny = -padding; ny < padding + 1; ny++) {
          this.ctx.fillText(player.n, name_x + nx, name_y + ny)
        }
      }

      this.ctx.fillStyle = "#FFF"
      this.ctx.fillText(player.n, name_x, name_y)

      this.ctx.drawImage(
        this.images.addImage("character"),
        1,
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
    }
  }


  tick = () => {
    this.drawMap()
  }
}