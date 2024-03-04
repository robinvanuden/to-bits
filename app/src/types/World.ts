export default interface World {
  compressionlevel: number
  height: number
  infinite: boolean
  layers: WorldLayer[]
  nextlayerid: number
  nextobjectid: number
  orientation: string
  renderorder: string
  tiledversion: string
  tileheight: number
  tilesets: WorldTileSet[]
  tilewidth: number
  type: string
  version: string
  width: number
}

export interface WorldTileSet {
  firstgid: number,
  source: string
}

export interface WorldLayer {
  data: number[]
  height: number
  id: number
  name: string,
  opacity: number
  type: string,
  visible: boolean
  width: number
  x: number
  y: number
}