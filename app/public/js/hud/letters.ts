const img = new Image()
img.src = "/img/hud/letters.png"
img.onload = () => {
	console.log("Letters loaded")
}

export default class Letters {

	characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_.:!"
	width = 0
	height = 0
	x = 0
	y = 0
	meta = []

	constructor(word: string) {
		let x = 0
		this.width = 0
		this.height = 7
		for (const char of word.toUpperCase()) {
			const {width, height, sx, sy, letter} = this.loadLetterMeta(char)
			this.meta.push({x, width, height, sx, sy, letter})
			x += width - 1
			this.width += width - 1
		}
	}

	loadLetterMeta(letter: string) {
		const index = this.characters.indexOf(letter)
		let sx = 0
		let width = 7
		const sy = Math.floor((index) * 7)
		switch (letter) {
		case "I":
		case "!":
		case ":":
			width = 3
			sx = 2
			break
		case " ":
		case ".":
			width = 3
			sx = 0
			break
		}
		return {
			width,
			height: 7,
			sx,
			sy,
			letter
		}
	}

	public render(ctx: CanvasRenderingContext2D, x: number, y: number, ratio = 1) {
		this.x = x
		this.y = y
		// this.x = x;
		// this.y = y;
		// for (const char of word) {
		// 	const { width, height, sx, sy } = this.loadLetterMeta(char.toUpperCase())
		// 	ctx.drawImage(this.img, sx, sy, width, height, x, y, width, 7)
		// 	x += width - 1
		// 	this.width += width - 1
		// }
		// this.height = 7

		for (const {x: px, width, height, sx, sy, letter} of this.meta) {
			if (letter) {
				ctx.drawImage(
					img,
					sx,
					sy,
					width,
					height,
					x + px * ratio,
					y,
					width * ratio,
					height * ratio
				)
			}
		}
	}
}