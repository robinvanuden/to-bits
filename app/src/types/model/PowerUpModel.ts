import TextureModel from "./TextureModel"
import {PowerType} from "../../entities/PowerUp"

export interface PowerUpModel {
	id: string
	u: number
	ty: PowerType
	t: TextureModel
}