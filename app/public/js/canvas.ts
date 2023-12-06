const FONT_TEXT = "FiveFontsatFreddy"

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

    this.setDimensions(window.innerWidth, window.innerHeight)

    window.addEventListener("resize", () => this.setDimensions(window.innerWidth, window.innerHeight))
  }

  font = (size: number, family: string = FONT_TEXT) => `${this.size(size)}px ${family}`

  size = (n: number) => n * this.ratio

  width = () => this.__width

  height = () => this.__height

  setDimensions = (width: number, height: number) => {
    this.__width = this.__canvas.width = width * this.ratio
    this.__height = this.__canvas.height = height * this.ratio
  }

  clear = () => {
    if (this.ctx.imageSmoothingEnabled) {
      this.ctx.imageSmoothingEnabled = false
    }
    if (this.ctx.imageSmoothingQuality !== "low") {
      this.ctx.imageSmoothingQuality = "low"
    }
    this.ctx.clearRect(0, 0, this.__width, this.__width)
  }
}