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
		if (playerToFocus && playerToFocus.d == undefined) {
			this.cx = Math.round((this.canvas.tile(playerToFocus.x) + this.canvas.tile(playerToFocus.w) * .5) - this.canvas.width() * .5)
			this.cy = Math.round((this.canvas.tile(playerToFocus.y) + this.canvas.tile(playerToFocus.h) * .5) - this.canvas.height() * .5)
		}

		this.ctx.lineWidth = this.canvas.size(8)
		for (const entity of this.data.entities()) {
			switch (entity.t) {
			case "ARROW":
				this.ctx.fillStyle = "#cec3bd"
				this.ctx.fillRect(
					this.canvas.tile(entity.x) - this.cx,
					this.canvas.tile(entity.y) - this.cy,
					this.canvas.tile(entity.w),
					this.canvas.tile(entity.h)
				)
				break
			case "BOMB":
				this.ctx.fillStyle = "#FFF"
				if (entity.e) {
					this.ctx.fillRect(
						this.canvas.tile(entity.e.x) - this.cx,
						this.canvas.tile(entity.e.y) - this.cy,
						this.canvas.tile(entity.e.w),
						this.canvas.tile(entity.e.h)
					)
				} else {
					const passed_millis = Math.round((Date.now() - entity.s))
					const passed = Math.round((passed_millis) / 150)
					this.ctx.fillStyle = passed_millis > 1000 && (passed % 2) === 0 ? "#FFF" : "#000"
					// this.ctx.fillRect(
					// 	this.canvas.tile(entity.x) - this.cx,
					// 	this.canvas.tile(entity.y) - this.cy,
					// 	this.canvas.tile(entity.w),
					// 	this.canvas.tile(entity.h)
					// )
					const FRAME_NEUTRAL = 3
					const FRAME_PRIMED = 3 + 16
					const FRAME_PRIMED2 = 3 + 32
					const frame = passed_millis <= 1000 ? FRAME_NEUTRAL : (passed % 2) === 0 ? FRAME_PRIMED2 : FRAME_PRIMED
					this.ctx.drawImage(
						this.images.addImage("img/bomb.png"),
						frame,
						2,
						this.canvas.size(entity.w),
						this.canvas.size(entity.h),
						this.canvas.tile(entity.x) - this.cx,
						this.canvas.tile(entity.y) - this.cy,
						this.canvas.tile(entity.w),
						this.canvas.tile(entity.h)
					)

				}
				break
			case "BOOMERANG":
				this.ctx.fillStyle = "#503d27"
				this.ctx.fillRect(
					this.canvas.tile(entity.x) - this.cx,
					this.canvas.tile(entity.y) - this.cy,
					this.canvas.tile(entity.w),
					this.canvas.tile(entity.h)
				)
				break
			case "FIREBALL":
				this.ctx.fillStyle = "#e0511c"
				this.ctx.fillRect(
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
					if (!tile.pu && layer.n === "floor") {
						this.ctx.drawImage(
							this.images.addImage(tile.i),
							tile.ox,
							tile.oy,
							tile.w,
							tile.h,
							this.canvas.tile(tile.x) - this.cx,
							this.canvas.tile(tile.y) - this.cy,
							this.canvas.tile(tile.w),
							this.canvas.tile(tile.h)
						)
					} else if (tile.pu && layer.n === "powers") {
						this.ctx.drawImage(
							this.images.addImage(tile.i),
							tile.ox,
							tile.oy,
							tile.w,
							tile.h,
							this.canvas.tile(tile.x) - this.cx,
							this.canvas.tile(tile.y) - this.cy,
							this.canvas.tile(tile.w),
							this.canvas.tile(tile.h)
						)
						switch (tile.pu.t) {
						case "ARROW":
							this.ctx.fillStyle = "#cec3bd"
							break
						case "BOMB":
							this.ctx.fillStyle = "#1d1d1e"
							break
						case "BOOMERANG":
							this.ctx.fillStyle = "#6c492e"
							break
						case "FIREBALL":
							this.ctx.fillStyle = "#e87619"
							break
						}
						this.ctx.fillRect(
							this.canvas.tile(tile.x + 5) - this.cx,
							this.canvas.tile(tile.y + 5) - this.cy,
							this.canvas.tile(6),
							this.canvas.tile(6)
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

			const player_w = this.canvas.tile(player.w)
			const player_h = this.canvas.tile(player.h)
			const player_x = this.canvas.tile(player.x)
			const player_y = this.canvas.tile(player.y)

			const name_x = player_x - this.cx + player_w * .5
			const name_y = player_y - this.cy - this.canvas.size(12)

			this.ctx.font = this.canvas.font(1)
			this.ctx.textAlign = "center"
			this.ctx.fillStyle = "#FFF"
			this.ctx.strokeStyle = "#000"
			this.ctx.lineWidth = this.canvas.size(8)
			this.ctx.strokeText(player.n.toLowerCase(), name_x, name_y)
			this.ctx.fillText(player.n.toLowerCase(), name_x, name_y)

			const sx = player.l.r ? 1 : 2
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
				player_x - this.cx,
				player_y - this.cy,
				player_w,
				player_h
			)
		}
	}
}