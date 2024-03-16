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

  tileWidth = () => this.data.map()[0][0]?.w || 0
  mapWidth = () => (this.data.map().map(l => l.ls[0].x).sort((a, b) => b - a)[0] || 0) + this.tileWidth()
  mapHeight = () => (this.data.map().map(l => l.ls[0].y).sort((a, b) => b - a)[0] || 0) + this.tileWidth()

  tick = () => {
    let cx: number
    let cy: number

    const playerToFocus = this.you()
    if (playerToFocus && playerToFocus.d == undefined) {
      cx = Math.round((this.canvas.size(playerToFocus.x) + this.canvas.size(playerToFocus.w) * .5) - this.canvas.width() * .5)
      cy = Math.round((this.canvas.size(playerToFocus.y) + this.canvas.size(playerToFocus.h) * .5) - this.canvas.height() * .5)
      this.canvas.setBackgroundHue(playerToFocus.y, 4000)
    } else {
      cx = Math.round((this.canvas.size(this.mapWidth() * .5)) - this.canvas.width() * .5)
      cy = Math.round((this.canvas.size(this.mapHeight() * .5)) - this.canvas.height() * .5)
      this.canvas.setBackgroundHue(8, 4000)
    }
    for (const layer of this.data.map()) {
      for (const tile of layer.ls) {
        this.ctx.fillStyle = tile.c || "#000"
        if (tile.i) {
          if (!tile.pu && layer.n === "floor") {
            this.ctx.drawImage(
              this.images.addImage(tile.i),
              0,
              0,
              16,
              16,
              this.canvas.size(tile.x) - cx,
              this.canvas.size(tile.y) - cy,
              this.canvas.size(tile.w),
              this.canvas.size(tile.h)
            )
          } else if (tile.pu && layer.n === "powers") {
            console.log()
            this.ctx.drawImage(
              this.images.addImage(tile.i),
              0,
              0,
              16,
              16,
              this.canvas.size(tile.x) - cx,
              this.canvas.size(tile.y) - cy,
              this.canvas.size(tile.w),
              this.canvas.size(tile.h)
            )
            switch (tile.pu.t) {
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
              this.canvas.size(tile.pu.x) - cx,
              this.canvas.size(tile.pu.y) - cy,
              this.canvas.size(tile.pu.w),
              this.canvas.size(tile.pu.h)
            )
          }
        }
      }
    }

    for (const player of this.data.players().filter(p => p.d === undefined).sort((a, b) => {
      const you_id = (this.you()?.i || "")
      return (a.i === you_id ? 1 : -1) - (b.i === you_id ? 1 : -1) || a.i.localeCompare(b.i)
    })) {

      this.ctx.globalAlpha = player.dc != undefined ? 0.5 : 1

      const player_w = this.canvas.size(player.w)
      const player_h = this.canvas.size(player.h)
      const player_x = this.canvas.size(player.x)
      const player_y = this.canvas.size(player.y)

      const name_x = player_x - cx + player_w * .5
      const name_y = player_y - cy - this.canvas.size(12)

      this.ctx.font = this.canvas.font(1)
      this.ctx.textAlign = "center"
      this.ctx.fillStyle = "#FFF"
      this.ctx.strokeStyle = "#000"
      this.ctx.lineWidth = this.canvas.size(8)
      this.ctx.strokeText(player.n.toLowerCase(), name_x, name_y)
      this.ctx.fillText(player.n.toLowerCase(), name_x, name_y)

      let sx = player.l.r ? 1 : 2
      if ((!player.m.u && !player.m.d) && (player.m.r || player.m.l)) {
        player.a += 1
      } else {
        player.a = 0
      }
      if (player.a >= 20) {
        player.a = 0
      }
      let image_name = ""
      if (player.vy !== 0 || player.a >= 10) {
        image_name = "image/" + player.uid + (player.l.r ? "r" : "l") + 1 + ".png"
      } else {
        image_name = "image/" + player.uid + (player.l.r ? "r" : "l") + 0 + ".png"
      }
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