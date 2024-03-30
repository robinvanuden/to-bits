export default class Images {

	images = {}
	host: URL

	constructor(host: URL) {
		this.host = host
	}

	addImage = (file_path: string): HTMLImageElement => {
		if (this.images[file_path]) {
			return this.images[file_path]
		}
		const url = new URL(this.host.toString())
		const image = new Image()
		url.pathname = file_path
		image.src = url.toString()
		image.style.imageRendering = "pixelated"
		this.images[file_path] = image
		return image
	}

}