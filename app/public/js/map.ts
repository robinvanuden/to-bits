import Images from "./images"
import Data from "./data"
import Canvas from "./canvas"
import {PowerType} from "./model/PowerUpModel"

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
			this.cx = Math.round((this.canvas.size(playerToFocus.x) + this.canvas.size(playerToFocus.w) * .5) - this.canvas.width() * .5)
			this.cy = Math.round((this.canvas.size(playerToFocus.y) + this.canvas.size(playerToFocus.h) * .5) - this.canvas.height() * .5)
		}

		this.ctx.lineWidth = this.canvas.size(8)
		for (const entity of this.data.entities()) {
			switch (entity.t) {
			case "ARROW":
				this.ctx.drawImage(
					this.images.loadImage("/img/arrow.png"),
					entity.vx <= 0 ? entity.w + 2 : 1,
					6,
					entity.w,
					entity.h,
					this.canvas.size(entity.x) - this.cx,
					this.canvas.size(entity.y) - this.cy,
					this.canvas.size(entity.w),
					this.canvas.size(entity.h)
				)
				break
			case "BOMB":
				if (entity.e) {
					this.ctx.fillStyle = "#FFF"
					this.ctx.fillRect(
						this.canvas.size(entity.e.x) - this.cx,
						this.canvas.size(entity.e.y) - this.cy,
						this.canvas.size(entity.e.w),
						this.canvas.size(entity.e.h)
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
						this.canvas.size(entity.x) - this.cx,
						this.canvas.size(entity.y) - this.cy,
						this.canvas.size(entity.w),
						this.canvas.size(entity.h)
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
					this.canvas.size(entity.x) - this.cx,
					this.canvas.size(entity.y) - this.cy,
					this.canvas.size(entity.w),
					this.canvas.size(entity.h)
				)
				break
			case "FIREBALL":
				this.ctx.drawImage(
					this.images.loadImage("/img/fireball.png"),
					4,
					4,
					entity.w,
					entity.h,
					this.canvas.size(entity.x) - this.cx,
					this.canvas.size(entity.y) - this.cy,
					this.canvas.size(entity.w),
					this.canvas.size(entity.h)
				)
				break
			default:
				console.log("Unknown entity type", entity.t)
				break
			}
		}
		for (const layer of this.data.map()) {
			for (const tile of layer.ls) {
				if (tile.t.i) {
					if ((!tile.p && layer.n === "solids") || (!tile.p && layer.n === "semi_solids") || (!tile.p && layer.n === "danger") || (tile.p && layer.n === "items")) {
						this.ctx.drawImage(
							this.images.loadImage(tile.t.i),
							tile.t.x,
							tile.t.y,
							tile.t.w,
							tile.t.h,
							this.canvas.size(tile.x) - this.cx,
							this.canvas.size(tile.y) - this.cy,
							this.canvas.size(tile.w),
							this.canvas.size(tile.h)
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

			const player_w = this.canvas.size(player.w)
			const player_h = this.canvas.size(player.h)
			const player_x = this.canvas.size(player.x)
			const player_y = this.canvas.size(player.y)

			let x = 0
			let y = 0
			if ((player.dmg?.tme || -1) + 100 > Date.now()) {
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
				this.images.loadPlayer(player.uid, player.l.l),
				Math.round(sx + x),
				Math.round(y),
				13,
				16,
				player_x - this.cx,
				player_y - this.cy,
				player_w,
				player_h
			)
			if (player.pu[player.ps]) {
				const power = player.pu[player.ps]

				let ix = 0, iy = 0

				ix = 0
				if (player.l.l) {
					ix = 19
				}
				switch (power.t) {
				case PowerType.BOMB:
					iy = 0
					break
				case PowerType.SWORD:
					iy = 16
					break
				case PowerType.ARROW:
					iy = 32
					break
				case PowerType.BOOMERANG:
					iy = 48
					break
				case PowerType.FIREBALL:
					iy = 64
					break
				case PowerType.HEALTH:
					iy = 80
					break
				default:
					ix = -16
					iy = -16
					break
				}
				this.ctx.drawImage(
					this.images.loadImage("/img/items.png"),
					ix,
					iy,
					16,
					16,
					player_x - this.cx,
					player_y - this.cy,
					this.canvas.size(16),
					this.canvas.size(16)
				)
			}
		}
	}
}