export const PROP_SEMI_SOLID = "is_semi_solid"

export default interface TileSet {
  columns: number
  image: string
  imageheight: number
  imagewidth: number
  margin: number
  name: string
  spacing: number
  tilecount: number
  tiledversion: string
  tileheight: number
  tilewidth: number
  type: string
  version: string
  properties: TileSetProperty[] | undefined
}

export interface TileSetProperty {
  name: string
  type: string
  value: any
}

export interface TileSetItem {
  id: number
  tile_id: number
  type: string
  version: string
  tiledversion: string
  height: number
  width: number
  properties: TileSetProperty[] | undefined
}