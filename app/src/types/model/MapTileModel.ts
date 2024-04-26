import {PowerUpModel} from "./PowerUpModel"
import TextureModel from "./TextureModel"

export interface TileLayerModel {
  n: string,
  ls: MapTileModel[]
}

export default interface MapTileModel {
  x: number
  y: number
  w: number
  h: number
  p: PowerUpModel | undefined,
  t: TextureModel
}