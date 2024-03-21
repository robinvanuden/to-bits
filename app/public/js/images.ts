export default class Images {

	images = {}
	host: URL

	constructor(host: URL) {
		this.host = host
	}

	addImage = (name: string): HTMLImageElement => {
		if (this.images[name]) {
			return this.images[name]
		}
		const url = new URL(this.host.toString())
		const image = new Image()
		url.pathname = name
		image.src = url.toString()
		image.style.imageRendering = "pixelated"
		this.images[name] = image
		return image
	}

}