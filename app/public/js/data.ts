import {TileLayerModel} from "./model/TileModel"
import PlayerModel from "./model/PlayerModel"
import EntityModel from "./model/EntityModel"

export default class Data {

	private ID: string = ""
	private VERSION: string = ""
	private _map: TileLayerModel[] = []
	private _players: PlayerModel[] = []
	private _projectiles: EntityModel[] = []

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
		this._players = players.filter(p => uuids.includes(p.i))
	}

	players = () => this._players

	setProjectiles = (projectiles: EntityModel[]) => this._projectiles = projectiles

	entities = () => this._projectiles
}