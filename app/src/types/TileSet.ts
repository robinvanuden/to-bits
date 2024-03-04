import PowerUp from "./PowerUp"

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
}

export interface TileSetItem {
  id: number
  type: string
  version: string
  tiledversion: string
  height: number
  width: number
}

export interface Tile {
  id: number
  x: number
  y: number
  type: string
  version: string
  tiledversion: string
  height: number
  width: number
  layer: string
  power_up: PowerUp | undefined
}