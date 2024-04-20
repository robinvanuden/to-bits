import Images from "./images"
import Data from "./data"
import Canvas from "./canvas"

export default class Map {

	cx: number
	cy: number
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

	tick = () => {

		const playerToFocus = this.you()
		if (playerToFocus && playerToFocus.tod < 0) {
			this.cx = Math.round((this.canvas.tile(playerToFocus.x) + this.canvas.tile(playerToFocus.w) * .5) - this.canvas.width() * .5)
			this.cy = Math.round((this.canvas.tile(playerToFocus.y) + this.canvas.tile(playerToFocus.h) * .5) - this.canvas.height() * .5)
		}

		this.ctx.lineWidth = this.canvas.size(8)
		for (const entity of this.data.entities()) {
			switch (entity.t) {
			case "ARROW":
				this.ctx.drawImage(
					this.images.loadImage("/img/arrow.png"),
					entity.vx <= 0 ? entity.w + 1 : 1,
					6,
					entity.w,
					entity.h,
					this.canvas.tile(entity.x) - this.cx,
					this.canvas.tile(entity.y) - this.cy,
					this.canvas.tile(entity.w),
					this.canvas.tile(entity.h)
				)
				break
			case "BOMB":
				if (entity.e) {
					this.ctx.fillStyle = "#FFF"
					this.ctx.fillRect(
						this.canvas.tile(entity.e.x) - this.cx,
						this.canvas.tile(entity.e.y) - this.cy,
						this.canvas.tile(entity.e.w),
						this.canvas.tile(entity.e.h)
					)
				} else {
					const passed_millis = Math.round((Date.now() - entity.s))
					const passed = Math.round((passed_millis) / 150)
					const FRAME_NEUTRAL = 3
					const FRAME_PRIMED = 3 + 16
					const FRAME_PRIMED2 = 3 + 32
					const frame = passed_millis <= 1000 ? FRAME_NEUTRAL : (passed % 2) === 0 ? FRAME_PRIMED2 : FRAME_PRIMED
					this.ctx.drawImage(
						this.images.loadImage("/img/bomb.png"),
						frame,
						2,
						entity.w,
						entity.h,
						this.canvas.tile(entity.x) - this.cx,
						this.canvas.tile(entity.y) - this.cy,
						this.canvas.tile(entity.w),
						this.canvas.tile(entity.h)
					)

				}
				break
			case "BOOMERANG":
				this.ctx.drawImage(
					this.images.loadImage("/img/boomerang.png"),
					4 + (Math.round(Math.round(Date.now() - entity.s) / 100) % 4 * 16),
					4,
					entity.w,
					entity.h,
					this.canvas.tile(entity.x) - this.cx,
					this.canvas.tile(entity.y) - this.cy,
					this.canvas.tile(entity.w),
					this.canvas.tile(entity.h)
				)
				break
			case "FIREBALL":
				this.ctx.drawImage(
					this.images.loadImage("/img/fireball.png"),
					4,
					4,
					entity.w,
					entity.h,
					this.canvas.tile(entity.x) - this.cx,
					this.canvas.tile(entity.y) - this.cy,
					this.canvas.tile(entity.w),
					this.canvas.tile(entity.h)
				)
				break
			default:
				console.log("Unknown entity type", entity.t)
				break
			}
		}
		for (const layer of this.data.map()) {
			for (const tile of layer.ls) {
				this.ctx.fillStyle = tile.c || "#000"
				if (tile.i) {
					if ((!tile.pu && layer.n === "floor") || (tile.pu && layer.n === "powers")) {
						this.ctx.drawImage(
							this.images.loadImage(tile.i),
							tile.ox,
							tile.oy,
							tile.w,
							tile.h,
							this.canvas.tile(tile.x) - this.cx,
							this.canvas.tile(tile.y) - this.cy,
							this.canvas.tile(tile.w),
							this.canvas.tile(tile.h)
						)
					}
				}
			}
		}

		for (const player of this.data.players().filter(p => p.tod < 0).sort((a, b) => {
			const you_id = (this.you()?.i || "")
			return (a.i === you_id ? 1 : -1) - (b.i === you_id ? 1 : -1) || a.i.localeCompare(b.i)
		})) {

			this.ctx.globalAlpha = player.tdc < 0 ? 1 : 0.5

			const player_w = this.canvas.tile(player.w)
			const player_h = this.canvas.tile(player.h)
			const player_x = this.canvas.tile(player.x)
			const player_y = this.canvas.tile(player.y)

			const name_x = player_x - this.cx + player_w * .5
			const name_y = player_y - this.cy - this.canvas.tile(3)

			this.ctx.font = this.canvas.font(1)
			this.ctx.textAlign = "center"
			this.ctx.fillStyle = "#FFF"
			this.ctx.strokeStyle = "#000"
			this.ctx.lineWidth = this.canvas.tile(2)
			this.ctx.strokeText(player.n.toLowerCase(), name_x, name_y)
			this.ctx.fillText(player.n.toLowerCase(), name_x, name_y)

			let x = 0
			let y = 0
			let image = this.images.loadPlayer(player.uid, player.l.l)
			if (player.tdm + 100 > Date.now()) {
				y = 16
			}
			if (player.vy < 0) {
				x = 32
			} else if (player.vy > 0) {
				x = 16
			} else if (player.m.u || player.m.d) {
				x = 0
			} else if ((player.m.r || player.m.l) && Math.round((Date.now() / 250) % 1) === 0) {
				x = 16
			}
			const sx = player.l.r ? 1 : 2
			this.ctx.drawImage(
				image,
				sx + x,
				y,
				13,
				16,
				player_x - this.cx,
				player_y - this.cy,
				player_w,
				player_h
			)
		}
	}
}