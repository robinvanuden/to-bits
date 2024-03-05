import Data from "./data"
import Canvas from "./canvas"

export default class Hud {

  canvas: Canvas
  data: Data
  ctx: CanvasRenderingContext2D

  DEBUG = false
  LOADING = true
  NOPE = false

  COLOR_BLACK = "#151414"
  COLOR_WHITE = "#F3F3F3"

  constructor(canvas: Canvas, data: Data) {
    this.canvas = canvas
    this.data = data
    this.ctx = canvas.ctx
  }

  toggleDebug = () => this.DEBUG = !this.DEBUG

  setLoading = (loading: boolean) => this.LOADING = loading

  loading = () => this.LOADING

  setNope = (nope: boolean) => this.NOPE = nope

  nope = () => this.NOPE

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
    // Background
    this.ctx.fillStyle = "rgba(0,0,0,0.5)"
    this.ctx.fillRect(0, 0, this.canvas.width(), this.canvas.height())

    // Title
    this.ctx.fillStyle = this.COLOR_WHITE
    this.ctx.textAlign = "center"
    this.ctx.font = this.canvas.font(6)
    this.ctx.fillText("YOU DIED!", this.canvas.width() / 2, this.canvas.height() / 2)

    // Subtitle
    this.ctx.font = this.canvas.font(1.5)
    this.ctx.fillText("Respawn in: " + Math.round(((you.d + 5000) - now) / 1000), this.canvas.width() / 2, (this.canvas.height() / 2) + this.canvas.size(70))

  }
  drawLoading = () => {
    this.ctx.fillStyle = this.COLOR_BLACK
    this.ctx.fillRect(0, 0, this.canvas.width(), this.canvas.height())
    this.ctx.textAlign = "center"
    this.ctx.fillStyle = this.COLOR_WHITE
    this.ctx.font = this.canvas.font(7)
    this.ctx.fillText("LOADING", this.canvas.width() * .5, this.canvas.height() * .5)
  }
  drawNope = () => {
    this.ctx.fillStyle = this.COLOR_BLACK
    this.ctx.fillRect(0, 0, this.canvas.width(), this.canvas.height())
    this.ctx.textAlign = "center"
    this.ctx.fillStyle = this.COLOR_WHITE
    this.ctx.font = this.canvas.font(7)
    this.ctx.fillText("NOPE", this.canvas.width() * .5, this.canvas.height() * .5)
  }
  drawDebug = (delta: number) => {
    this.ctx.font = this.canvas.font(.7)
    this.ctx.fillStyle = this.COLOR_WHITE
    this.ctx.textAlign = "left"
    this.ctx.strokeStyle = this.COLOR_BLACK
    this.ctx.lineWidth = this.canvas.size(4)
    const SPACE = this.canvas.size(12)

    const debug_texts = ["version: " + this.data.version()]
    debug_texts.push("delta: " + delta)

    const you = this.you()
    if (you != null && you.d === undefined) {
      debug_texts.push("name: " + you.n)
      debug_texts.push("x: " + you.x)
      debug_texts.push("y: " + you.y)
      debug_texts.push("alive: " + you.d !== undefined ? "true" : "false")

      // Moved directions
      for (const direction in you.m) {
        const value = you.m[direction] || false
        debug_texts.push("m." + direction + ": " + value)
      }
      // Look directions
      for (const direction in you.l) {
        const value = you.l[direction] || false
        debug_texts.push("l." + direction + ": " + value)
      }
      if (you.pu.length > 0) {
        debug_texts.push("powers:")
        // Power ups
        for (const power of you.pu) {
          debug_texts.push("- " + power.t)
        }
      } else {
        debug_texts.push("powers: -")
      }
      if (you.br.length > 0) {
        debug_texts.push("boomerangs:")
        for (const boomerang of you.br) {
          debug_texts.push("-boomerang:")
          debug_texts.push("--x: " + boomerang.x)
          debug_texts.push("--y: " + boomerang.y)
          debug_texts.push("--vx: " + boomerang.vx)
          debug_texts.push("--vy: " + boomerang.vy)
        }
      } else {
        debug_texts.push("boomerang: -")
      }
      if (you.fb.length > 0) {
        debug_texts.push("fireballs:")
        for (const fireball of you.fb) {
          debug_texts.push("-fireball:")
          debug_texts.push("--x: " + fireball.x)
          debug_texts.push("--y: " + fireball.y)
          debug_texts.push("--vx: " + fireball.vx)
          debug_texts.push("--vy: " + fireball.vy)
        }
      } else {
        debug_texts.push("fireball: -")
      }
    }

    let i = 0
    for (const line of debug_texts) {
      this.ctx.strokeText(line, this.canvas.size(6), this.canvas.size(14) + (SPACE * i))
      this.ctx.fillText(line, this.canvas.size(6), this.canvas.size(14) + (SPACE * i))
      i++
    }
  }

  drawVersion = () => {
    this.ctx.font = this.canvas.font(1)
    this.ctx.fillStyle = this.COLOR_WHITE
    this.ctx.textAlign = "right"
    this.ctx.strokeStyle = this.COLOR_BLACK
    this.ctx.lineWidth = this.canvas.size(4)
    const line = "v" + this.data.version()
    const x = this.canvas.size(this.canvas.width())
    const y = this.canvas.size(14)

    this.ctx.strokeText(line, x, y)
    this.ctx.fillText(line, x, y)
  }

  tick = (delta: number) => {
    this.drawMessage()
    this.drawVersion()
    if (this.loading()) this.drawLoading()
    if (this.DEBUG) this.drawDebug(delta)
    if (this.nope()) this.drawNope()
  }

}