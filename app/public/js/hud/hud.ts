import Data from "../data"
import Canvas from "../canvas"
import Images from "../images"
import Letters from "./letters"
import {PowerType} from "../model/PowerUpModel"

export default class Hud {
	canvas: Canvas
	data: Data
	images: Images
	ctx: CanvasRenderingContext2D
	LOADING = true
	NOPE = false

	COLOR_BLACK = "#000000"

	constructor(canvas: Canvas, data: Data, images: Images) {
		this.canvas = canvas
		this.data = data
		this.images = images
		this.ctx = canvas.ctx
	}

	setLoading = (loading: boolean) => this.LOADING = loading

	loading = () => this.LOADING

	setNope = (nope: boolean) => this.NOPE = nope

	nope = () => this.NOPE

	you = () => this.data.players().find(p => p.i === this.data.id()) || undefined

	drawYouDied = () => {
		const you = this.you()
		if (!you) {
			return
		}
		if (you.tod < 0) {
			return
		}
		const now = Date.now()
		// Background
		this.ctx.fillStyle = "rgba(255,0,0,0.7)"
		this.ctx.fillRect(0, 0, this.canvas.width(), this.canvas.height())

		const died_text = new Letters("you died!")
		const died_x = Math.round(this.canvas.width() * .5) - Math.round(died_text.width * 2 * .5)
		const died_y = Math.round(this.canvas.height() * .5) - Math.round(died_text.height * 2 * .5)
		died_text.render(this.ctx, died_x, died_y, 2)

		const seconds_left = Math.round(((you.tod + 5000) - now) / 1000)
		const respawn_text = new Letters("respawn in: " + seconds_left)
		const respawn_width = respawn_text.width
		const respawn_height = respawn_text.height
		const respawn_x = Math.round(this.canvas.width() * .5) - Math.round(respawn_width * .5)
		const respawn_y = Math.round(this.canvas.height() * .5) - Math.round(respawn_height * .5) + this.canvas.size(15)
		respawn_text.render(this.ctx, respawn_x, respawn_y)
	}
	drawLoading = () => {
		this.ctx.fillStyle = this.COLOR_BLACK
		this.ctx.fillRect(0, 0, this.canvas.width(), this.canvas.height())
		const loading = new Letters("loading...")
		const x = (this.canvas.width() * .5) - (loading.width * .5)
		const y = (this.canvas.height() * .5) - (loading.height * .5)

		loading.render(this.ctx, x, y)
	}
	drawNope = () => {
		this.ctx.fillStyle = this.COLOR_BLACK
		this.ctx.fillRect(0, 0, this.canvas.width(), this.canvas.height())
		const nope_text = new Letters("nope")
		const nope_width = nope_text.width
		const nope_height = nope_text.height
		const nope_x = Math.round(this.canvas.width() * .5) - Math.round(nope_width * .5)
		const nope_y = Math.round(this.canvas.height() * .5) - Math.round(nope_height * .5)
		nope_text.render(this.ctx, nope_x, nope_y)
	}

	drawInventory = () => {
		const you = this.you()
		if (!you || you.tod > 0) {
			return
		}
		const itemBar = this.images.loadImage("/img/hud/item_bar.png")

		let x = this.canvas.size(1)
		let y = this.canvas.size(1)

		for (let p = 0; p < 1; p++) {
			const power = you.pu[p]
			const selected = p === you.ps

			this.ctx.drawImage(
				itemBar,
				selected ? 0 : 16,
				0,
				16,
				16,
				x,
				y,
				this.canvas.size(16),
				this.canvas.size(16)
			)
			if (power) {
				let imageItem: CanvasImageSource
				switch (power.t) {
				case PowerType.ARROW:
					imageItem = this.images.loadImage("/img/bow.png")
					break
				case PowerType.BOOMERANG:
					imageItem = this.images.loadImage("/img/boomerang.png")
					break
				case PowerType.BOMB:
					imageItem = this.images.loadImage("/img/bomb.png")
					break
				case PowerType.FIREBALL:
					imageItem = this.images.loadImage("/img/fireball.png")
					break
				case PowerType.SWORD:
					imageItem = this.images.loadImage("/img/sword.png")
					break
				case PowerType.HEALTH:
					imageItem = this.images.loadImage("/img/health.png")
					break
				}

				this.ctx.drawImage(
					imageItem,
					0,
					0,
					16,
					16,
					x,
					y,
					this.canvas.size(16),
					this.canvas.size(16)
				)


				if (power.u > 1) {
					const power_uses = new Letters(power.u + "")
					power_uses.render(this.ctx, x + 9, y + 9)
				}
			}
			x += this.canvas.size(17)

		}
		x = this.canvas.size(18)
		y = this.canvas.size(1)

		// Health bar background
		this.ctx.fillStyle = this.COLOR_BLACK
		this.ctx.fillRect(x, y, this.canvas.size(16 * 3 + 2), this.canvas.size(7))
		// Health bar empty
		this.ctx.fillStyle = "#2b2929"
		this.ctx.fillRect(x + this.canvas.size(1), y + this.canvas.size(1), this.canvas.size(16 * 3), this.canvas.size(5))
		// Health bar filled
		this.ctx.fillStyle = "#ea3636"
		const health_width = (this.canvas.size(16 * 3) * (you.hp / you.hpm))
		this.ctx.fillRect(x + this.canvas.size(1), y + this.canvas.size(1), health_width, this.canvas.size(5))

		y += this.canvas.size(8)

		const your_name = new Letters(you.n)
		your_name.render(this.ctx, x, y)
	}

	tick = () => {
		this.drawInventory()
		this.drawYouDied()
		if (this.loading()) this.drawLoading()
		if (this.nope()) this.drawNope()
	}

}