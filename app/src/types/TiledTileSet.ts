export const PROP_SEMI_SOLID = "is_semi_solid"

export interface TiledTileSetProperty {
	name: string
	type: string
	value: unknown
}

export default interface TiledTileSet {
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
	properties: TiledTileSetProperty[] | undefined
}

export interface TiledTile {
	id: number
	tile_id: number
	type: string
	name: string
	source: string
	offset_x: number
	offset_y: number
	tileheight: number
	tilewidth: number
	version: string
	tiledversion: string
	height: number
	width: number
	properties: TiledTileSetProperty[] | undefined
}