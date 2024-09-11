import Data from "./data"
import Canvas from "./canvas"
import Images from "./images"
import {PowerType} from "./model/PowerUpModel"

export default class Hud {

	canvas: Canvas
	data: Data
	images: Images
	ctx: CanvasRenderingContext2D
	LOADING = true
	NOPE = false

	// COLOR_BLACK = "#151414"
	COLOR_BLACK = "#000000"
	COLOR_WHITE = "#F3F3F3"

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
		this.ctx.fillStyle = "rgba(255,0,0,0.7)"
		this.ctx.fillRect(0, 0, this.canvas.width(), this.canvas.height())

		const died = this.images.loadImage("/word/you died!.png")
		const died_width = died.width * 8
		const died_height = died.height * 8
		const died_x = (this.canvas.width() * .5) - (died_width * .5)
		const died_y = (this.canvas.height() * .5) - (died_height * .5)
		this.ctx.drawImage(
			died,
			died_x,
			died_y,
			died_width,
			died_height
		)

		const seconds_left = Math.round(((you.tod + 5000) - now) / 1000)

		const respawn_5 = this.images.loadImage(`/word/respawn in: 5.png`)
		const respawn_4 = this.images.loadImage(`/word/respawn in: 4.png`)
		const respawn_3 = this.images.loadImage(`/word/respawn in: 3.png`)
		const respawn_2 = this.images.loadImage(`/word/respawn in: 2.png`)
		const respawn_1 = this.images.loadImage(`/word/respawn in: 1.png`)
		const respawn_0 = this.images.loadImage(`/word/respawn in: 0.png`)
		let respawn: HTMLImageElement
		if (seconds_left >= 5) {
			respawn = respawn_5
		} else if (seconds_left >= 4) {
			respawn = respawn_4
		} else if (seconds_left >= 3) {
			respawn = respawn_3
		} else if (seconds_left >= 2) {
			respawn = respawn_2
		} else if (seconds_left >= 1) {
			respawn = respawn_1
		} else {
			respawn = respawn_0
		}
		const respawn_width = respawn.width * 2
		const respawn_height = respawn.height * 2
		const respawn_x = (this.canvas.width() * .5) - (respawn_width * .5)
		const respawn_y = (this.canvas.height() * .5) - (respawn_height * .5) + this.canvas.size(30)
		this.ctx.drawImage(
			respawn,
			respawn_x,
			respawn_y,
			respawn_width,
			respawn_height
		)
	}
	drawLoading = () => {
		this.ctx.fillStyle = this.COLOR_BLACK
		this.ctx.fillRect(0, 0, this.canvas.width(), this.canvas.height())
		const loading = this.images.loadImage("/word/loading....jpg")
		const loading_width = loading.width * 8
		const loading_height = loading.height * 8
		const x = (this.canvas.width() * .5) - (loading_width * .5)
		const y = (this.canvas.height() * .5) - (loading_height * .5)
		this.ctx.drawImage(
			loading,
			x,
			y,
			loading_width,
			loading_height
		)
	}
	drawNope = () => {
		this.ctx.fillStyle = this.COLOR_BLACK
		this.ctx.fillRect(0, 0, this.canvas.width(), this.canvas.height())
		const nope = this.images.loadImage("/word/nope.jpg")
		const nope_width = nope.width * 8
		const nope_height = nope.height * 8
		const x = (this.canvas.width() * .5) - (nope_width * .5)
		const y = (this.canvas.height() * .5) - (nope_height * .5)
		this.ctx.drawImage(
			nope,
			x,
			y,
			nope_width,
			nope_height
		)
	}

	drawInventory = () => {
		const you = this.you()
		if (!you || you.tod > 0) {
			return
		}
		const itemBar = this.images.loadImage("/img/hud/hud.items.png")

		let x = this.canvas.size(1)
		let y = this.canvas.size(1)

		for (let p = 0; p < 3; p++) {
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
					const uses = this.images.loadImage(`/word/${power.u}.png`)
					this.ctx.drawImage(
						uses,
						0,
						0,
						7,
						7,
						x + 18,
						y + 18,
						this.canvas.size(7),
						this.canvas.size(7)
					)
				}
			}
			x += this.canvas.size(17)

		}
		y += this.canvas.size(17)

		this.ctx.fillStyle = this.COLOR_BLACK
		this.ctx.fillRect(this.canvas.size(1), y, this.canvas.size(16 * 3 + 2), this.canvas.size(7))
		this.ctx.fillStyle = "#2b2929"
		this.ctx.fillRect(this.canvas.size(2), y + this.canvas.size(1), this.canvas.size(16 * 3), this.canvas.size(5))
		this.ctx.fillStyle = "#ea3636"
		const health_width = this.canvas.size(16 * 3) * (you.hp / you.hpm)
		this.ctx.fillRect(this.canvas.size(2), y + this.canvas.size(1), health_width, this.canvas.size(5))

		y += this.canvas.size(8)

		const nameTag = this.images.loadImage(`/word/${you.n}.png`)
		this.ctx.drawImage(
			nameTag,
			0,
			0,
			nameTag.width,
			nameTag.height,
			this.canvas.size(1),
			y,
			this.canvas.size(nameTag.width),
			this.canvas.size(nameTag.height),
		)
	}

	tick = () => {
		this.drawInventory()
		this.drawMessage()
		if (this.loading()) this.drawLoading()
		if (this.nope()) this.drawNope()
	}

}