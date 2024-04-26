import PowerUpModel from "./PowerUpModel"
import TextureModel from "./TextureModel"

export interface TileLayerModel {
	n: string
	ls: TileModel[]
}

export default interface TileModel {
	x: number
	y: number
	w: number // width
	h: number // height
	p: PowerUpModel | undefined
	t: TextureModel
}