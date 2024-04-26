export default interface TiledWorld {
  compressionlevel: number
  height: number
  infinite: boolean
	layers: TiledWorldLayer[]
  nextlayerid: number
  nextobjectid: number
  orientation: string
  renderorder: string
  tiledversion: string
  tileheight: number
	tilesets: TiledWorldTileSet[]
  tilewidth: number
  type: string
  version: string
  width: number
}

export interface TiledWorldTileSet {
  firstgid: number,
  source: string
}

export interface TiledWorldLayer {
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