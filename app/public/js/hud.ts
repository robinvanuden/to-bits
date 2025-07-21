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

	drawMessages = () => {
		let message_y = 1
		for (const message of this.data.messages().filter(m => m.timestamp + 5000 > Date.now())) {
			const message_text = this.images.loadImage(`/word/${message.value}.png`)
			const message_width = message_text.width
			const message_height = message_text.height
			const message_x = this.canvas.width() - message_width - 1

			this.ctx.drawImage(
				message_text,
				message_x,
				message_y,
				message_width,
				message_height
			)
			message_y += 8
		}
	}

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

		const died = this.images.loadImage("/word/you died!.png")
		const died_width = died.width * 4
		const died_height = died.height * 4
		const died_x = Math.round(this.canvas.width() * .5) - Math.round(died_width * .5)
		const died_y = Math.round(this.canvas.height() * .5) - Math.round(died_height * .5)
		this.ctx.drawImage(
			died,
			died_x,
			died_y,
			died_width,
			died_height
		)

		const seconds_left = Math.round(((you.tod + 5000) - now) / 1000)

		const respawn_5 = this.images.loadImage("/word/respawn in: 6.png")
		const respawn_4 = this.images.loadImage("/word/respawn in: 5.png")
		const respawn_3 = this.images.loadImage("/word/respawn in: 4.png")
		const respawn_2 = this.images.loadImage("/word/respawn in: 3.png")
		const respawn_1 = this.images.loadImage("/word/respawn in: 2.png")
		const respawn_0 = this.images.loadImage("/word/respawn in: 1.png")
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
		const respawn_width = respawn.width
		const respawn_height = respawn.height
		const respawn_x = Math.round(this.canvas.width() * .5) - Math.round(respawn_width * .5)
		const respawn_y = Math.round(this.canvas.height() * .5) - Math.round(respawn_height * .5) + this.canvas.size(30)
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
		const loading_width = loading.width * 4
		const loading_height = loading.height * 4
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
				case PowerType.BOMB:
					imageItem = this.images.loadImage("/img/bomb.png")
					break
				case PowerType.FIREBALL:
					imageItem = this.images.loadImage("/img/fireball.png")
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
						x + 9,
						y + 9,
						this.canvas.size(7),
						this.canvas.size(7)
					)
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

		const nameTag = this.images.loadImage(`/word/${you.n}.png`)
		this.ctx.drawImage(
			nameTag,
			0,
			0,
			nameTag.width,
			nameTag.height,
			x,
			y,
			this.canvas.size(nameTag.width),
			this.canvas.size(nameTag.height),
		)
	}

	tick = () => {
		this.drawInventory()
		this.drawMessages()
		this.drawYouDied()
		if (this.loading()) this.drawLoading()
		if (this.nope()) this.drawNope()
	}

}