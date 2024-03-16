import {PowerUpModel} from "./PowerUpModel"

export interface TileLayerModel {
  n: string,
  ls: TileModel[]
}

export interface TileModel {
  x: number
  y: number
  // width
  w: number
  // height
  h: number
  // type
  t: number
  i: string | undefined
  // damage
  d: number
  // spawn
  sp: boolean
  // walkable
  wa: boolean
  // solid
  so: boolean
  pu: PowerUpModel | undefined
}