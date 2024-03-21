import {TileLayerModel} from "./model/TileModel"
import PlayerModel from "./model/PlayerModel"
import ProjectileModel from "./model/ProjectileModel"

export default class Data {

	private ID: string = ""
	private VERSION: string = ""
	private _map: TileLayerModel[] = []
	private _players: PlayerModel[] = []
	private _projectiles: ProjectileModel[] = []

	setID = (id: string) => this.ID = id

	id = () => this.ID

	setVersion = (version: string) => this.VERSION = version

	version = () => this.VERSION

	setMap = (map: TileLayerModel[]) => this._map = map

	setMapLayer = (layer: TileLayerModel) => {
		this._map = this._map.filter(l => l.n !== layer.n)
		this._map.push(layer)
	}

	map = () => this._map

	setPlayers = (players: PlayerModel[]) => {
		const uuids = players.map(p => p.i)
		this._players = this._players.filter(p => uuids.includes(p.i))
		for (const p in players) {
			const player = players[p]
			const PLAYER = this._players[p] || null
			player.a = PLAYER?.a || 0
			this._players[p] = player
		}
	}

	players = () => this._players

	setProjectiles = (projectiles: ProjectileModel[]) => this._projectiles = projectiles

	projectiles = () => this._projectiles
}