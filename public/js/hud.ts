import Data from "./data"
import Canvas from "./canvas"

export default class Hud {

  canvas: Canvas
  data: Data
  ctx: CanvasRenderingContext2D

  DEBUG = false
  LOADING = true

  constructor(canvas: Canvas, data: Data) {
    this.canvas = canvas
    this.data = data
    this.ctx = canvas.ctx
  }

  toggleDebug = () => this.DEBUG = !this.DEBUG

  setLoading = (loading: boolean) => this.LOADING = loading

  loading = () => this.LOADING

  you = () => this.data.players().find(p => p.i === this.data.id()) || undefined

  drawMessage = () => {
    const you = this.you()
    if (!you) {
      return
    }
    if (you.d === undefined) {
      return
    }
    const now = Date.now()
    this.ctx.fillStyle = "rgba(0,0,0,0.5)"
    this.ctx.fillRect(0, 0, this.canvas.width(), this.canvas.height())
    this.ctx.textAlign = "center"
    this.ctx.fillStyle = "#FFF"
    this.ctx.font = this.canvas.font(50)
    this.ctx.fillText("YOU DIED!", this.canvas.width() / 2, this.canvas.height() / 2)

    this.ctx.font = this.canvas.font(24)
    this.ctx.fillText("Respawn in: " + Math.round(((you.d + 5000) - now) / 1000), this.canvas.width() / 2, (this.canvas.height() / 2) + this.canvas.size(70))

  }
  drawLoading = () => {
    this.ctx.fillStyle = "#1d1d1d"
    this.ctx.fillRect(0, 0, this.canvas.width(), this.canvas.height())
    this.ctx.textAlign = "center"
    this.ctx.fillStyle = "#f3f3f3"
    this.ctx.font = this.canvas.font(50)
    this.ctx.fillText("LOADING", this.canvas.width() * .5, this.canvas.height() * .5)
  }
  drawDebug = (delta: number) => {
    this.ctx.font = this.canvas.font(10)
    this.ctx.fillStyle = "white"
    this.ctx.textAlign = "left"
    let x = this.canvas.size(2)
    let y = this.canvas.size(20)
    const SPACE = this.canvas.size(12)
    this.ctx.fillText("version: " + this.data.version(), x, y)
    y += SPACE
    this.ctx.fillText("delta: " + delta, x, y)
    const you = this.you()
    if (you == null || you.d !== undefined) {
      return
    }
    console.log(you)
    y += SPACE
    this.ctx.fillText("name: " + you.n, x, y)
    y += SPACE
    this.ctx.fillText("x: " + you.x, x, y)
    y += SPACE
    this.ctx.fillText("y: " + you.y, x, y)
    y += SPACE
    this.ctx.fillText("vx: " + you.vx, x, y)
    y += SPACE
    this.ctx.fillText("vy: " + you.vy, x, y)
    y += SPACE
    this.ctx.fillText("falling: " + (you.vy !== 0) ? "true" : "false", x, y)
    y += SPACE
    this.ctx.fillText("alive: " + you.d !== undefined ? "true" : "false", x, y)
    // Moved directions
    for (const direction in you.m) {
      const value = you.m[direction] || false
      y += SPACE
      this.ctx.fillText("m." + direction + ": " + value, x, y)
    }
    // Look directions
    for (const direction in you.l) {
      const value = you.l[direction] || false
      y += SPACE
      this.ctx.fillText("l." + direction + ": " + value, x, y)
    }
    y += SPACE
    this.ctx.fillText("powers: " + (you.pu !== undefined && you.pu.length > 0 ? "" : "-"), x, y)
    // Look directions
    for (const power of you.pu) {
      y += SPACE
      this.ctx.fillText("- " + power.t, x, y)
    }

    const boomerang = you.br[0]
    if (!boomerang) {
      return
    }
    y += SPACE
    this.ctx.fillText("x: " + boomerang.x, x, y)
    y += SPACE
    this.ctx.fillText("y: " + boomerang.y, x, y)
    y += SPACE
    this.ctx.fillText("vx: " + boomerang.vx, x, y)
    y += SPACE
    this.ctx.fillText("vy: " + boomerang.vy, x, y)
  }

  tick = (delta: number) => {
    this.drawMessage()
    if (this.LOADING) this.drawLoading()
    if (this.DEBUG) this.drawDebug(delta)
  }

}