export default class Images {

  images = {}
  host: URL

  constructor(host: URL) {
    this.host = host
  }

  addImage = (name: string): HTMLImageElement => {
    if (this.images.hasOwnProperty(name)) {
      return this.images[name]
    }
    const image = new Image()
    image.src = this.host.toString() + `img/${name}.png`
    image.style.imageRendering = "pixelated"
    this.images[name] = image
    return image
  }

}