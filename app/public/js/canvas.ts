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
		this.ctx.imageSmoothingQuality = "low"
		this.ctx.imageSmoothingEnabled = false
		this.setDimensions()
	}

	size = (n: number) => Math.round(n * this.ratio)

	width = () => this.__width

	height = () => this.__height

	private setDimensions = () => {
		this.__width = this.__canvas.width = 240 * this.ratio
		this.__height = this.__canvas.height = 180 * this.ratio
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