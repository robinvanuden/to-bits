const FONT_TEXT = "Goodbye Despair"
const FONT_SIZE = 5

export default class Canvas {

	private readonly __canvas: HTMLCanvasElement
	readonly ctx: CanvasRenderingContext2D
	readonly ratio: number
	private __width: number = 0
	private __height: number = 0

	constructor(canvas: HTMLCanvasElement) {
		this.__canvas = canvas
		this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D
		this.ratio = window.devicePixelRatio || 1

		this.setDimensions()
	}

	font = (size: number, family: string = FONT_TEXT) => `${this.rem(size)}px ${family}`

	size = (n: number) => n * this.ratio

	rem = (n: number) => this.size(Math.round(FONT_SIZE * n))

	width = () => this.__width

	height = () => this.__height

	private setDimensions = () => {
		this.__width = this.__canvas.width = 480
		this.__height = this.__canvas.height = 360

		this.ctx.textRendering = "optimizeSpeed"
		this.ctx.fontKerning = "normal"
		this.ctx.imageSmoothingEnabled = false
		this.ctx.imageSmoothingQuality = "low"
		this.ctx.fontStretch = "normal"
	}

	clear = () => {
		this.ctx.clearRect(0, 0, this.__width, this.__width)
	}
}