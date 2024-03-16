import PowerUpModel from "./PowerUpModel"

export interface TileLayerModel {
  n: string
  ls: TileModel[]
}
export default interface TileModel {
  x: number
  y: number
  ox: number
  oy: number
  w: number // width
  h: number // height
  t: number // type
  c: string // color
  i: string | undefined
  d: number // damage
  sp: boolean // spawn
  wa: boolean // walkable
  so: boolean // solid
  pu: PowerUpModel | undefined
}