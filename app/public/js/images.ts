export default class Images {

	images = {}
	host: URL

	constructor(host: URL) {
		this.host = host
	}

	loadPlayer = (id: string, left: boolean, walking: boolean) => {
		return this.loadImage(`/i/p/${left ? "l" : "r"}/${walking ? 1 : 0}/${id}.png`)
	}

	loadAllPlayer = async (uid: string) => {
		await this.addPlayer(uid, true, true)
		await this.addPlayer(uid, true, false)
		await this.addPlayer(uid, false, true)
		await this.addPlayer(uid, false, false)
		await this.addPlayer("damaged", true, true)
		await this.addPlayer("damaged", true, false)
		await this.addPlayer("damaged", false, true)
		await this.addPlayer("damaged", false, false)
	}

	addPlayer = async (id: string, left: boolean, walking: boolean) => {
		await this.addImage(`/i/p/${left ? "l" : "r"}/${walking ? 1 : 0}/${id}.png`)
	}

	addImage = async (file_path: string) => {
		return new Promise<boolean>(resolve => {
			const image = new Image()
			image.src = file_path
			image.onload = () => {
				this.images[file_path] = image
				resolve(true)
			}
			image.onerror = () => resolve(false)
		})
	}

	loadImage = (file_path: string): HTMLImageElement => {
		if (this.images[file_path]) {
			return this.images[file_path]
		}
		const image = new Image()
		image.src = file_path
		this.images[file_path] = image
		return image
	}
}