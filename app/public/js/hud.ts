import Data from "./data"
import Canvas from "./canvas"
import {PowerType} from "./model/PowerUpModel"

export default class Hud {

	canvas: Canvas
	data: Data
	ctx: CanvasRenderingContext2D
	LOADING = true
	NOPE = false

	COLOR_BLACK = "#151414"
	COLOR_WHITE = "#F3F3F3"

	constructor(canvas: Canvas, data: Data) {
		this.canvas = canvas
		this.data = data
		this.ctx = canvas.ctx
	}

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
		if (you.tod < 0) {
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
		this.ctx.fillText("Respawn in: " + Math.round(((you.tod + 5000) - now) / 1000), this.canvas.width() / 2, (this.canvas.height() / 2) + this.canvas.size(70))

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

	drawInventory = () => {
		const you = this.you()
		if (!you) {
			return
		}
		let x = this.canvas.size(8)
		let y = this.canvas.size(16)
		this.ctx.font = this.canvas.font(1)
		this.ctx.strokeStyle = this.COLOR_BLACK
		this.ctx.fillStyle = this.COLOR_WHITE
		this.ctx.lineWidth = this.canvas.size(8)
		this.ctx.textAlign = "left"
		this.ctx.strokeText(you.n, x, y)
		this.ctx.fillText(you.n, x, y)
		y += this.canvas.size(16)
		this.ctx.strokeText("HP:" + you.hp, x, y)
		this.ctx.fillText("HP:" + you.hp, x, y)

		for (let p = 0; p < you.pu.length; p++) {
			const power = you.pu[p]
			this.ctx.fillStyle = p === you.ps ? "#bfb8b8" : this.COLOR_WHITE
			const i = Number(p) + 1
			y += this.canvas.size(16)
			this.ctx.strokeText(i + ". " + PowerType[power.t] + " " + power.u + "x", x, y)
			this.ctx.fillText(i + ". " + PowerType[power.t] + " " + power.u + "x", x, y)
		}

	}

	tick = () => {
		this.drawMessage()
		this.drawVersion()
		this.drawInventory()
		if (this.loading()) this.drawLoading()
		if (this.nope()) this.drawNope()
	}

}