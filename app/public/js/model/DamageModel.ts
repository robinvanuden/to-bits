import PlayerModel from "./PlayerModel"
import EntityModel from "./EntityModel"
import TileModel from "./TileModel"

export enum DamageCause {FALL, PLAYER, ITEM, BLOCK}

export interface DamageModel {
	val: number
	cau: DamageCause
	ply: PlayerModel | undefined
	ent: EntityModel | undefined
	tle: TileModel | undefined
	tme: number
}