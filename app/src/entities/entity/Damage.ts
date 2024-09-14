import MapTile from "../../world/MapTile"
import Player from "./Player"
import PlayerModel from "../../types/model/PlayerModel"
import ProjectileModel from "../../types/model/ProjectileModel"
import MapTileModel from "../../types/model/MapTileModel"
import Projectile from "../Projectile"


export enum DamageCause {FALL, PLAYER, ITEM, BLOCK}


export default interface Damage {
	value: number
	cause: DamageCause
	player: Player | undefined
	projectile: Projectile | undefined
	tile: MapTile | undefined
	timestamp: number
}

export interface DamageContext {
	player?: Player
	projectile?: Projectile
	tile?: MapTile
}

export interface DamageModel {
	val: number
	cau: DamageCause
	ply: PlayerModel | undefined
	ent: ProjectileModel | undefined
	tle: MapTileModel | undefined
	tme: number
}

export const damageToModel = (damage: Damage | undefined): DamageModel | undefined => {
	if (!damage) {
		return undefined
	}
	return {
		val: damage.value,
		cau: damage.cause,
		ply: damage.player?.toModel(),
		ent: damage.projectile?.toModel(),
		tle: damage.tile?.toModel(),
		tme: damage.timestamp,
	}
}