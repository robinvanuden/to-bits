import {TileLayerModel} from "./model/TileModel"
import PlayerModel from "./model/PlayerModel"
import EntityModel from "./model/EntityModel"

interface Message {
	value: string,
	timestamp: number
}

export default class Data {

	private ID: string = ""
	private VERSION: string = ""
	private _map: TileLayerModel[] = []
	private _players: PlayerModel[] = []
	private _projectiles: EntityModel[] = []
	private _messages: Message[] = []

	setID = (id: string) => this.ID = id

	id = () => this.ID

	setVersion = (version: string) => this.VERSION = version

	version = () => this.VERSION

	setMapLayer = (layer: TileLayerModel) => {
		this._map = this._map.filter(l => l.n !== layer.n)
		this._map.push(layer)
	}

	map = () => this._map

	setPlayers = (players: PlayerModel[]) => {
		const uuids = players.map(p => p.uid)
		this._players = players.filter(p => uuids.includes(p.uid))
	}

	players = () => this._players

	setProjectiles = (projectiles: EntityModel[]) => this._projectiles = projectiles

	entities = () => this._projectiles

	messages = () => this._messages

	addMessage(message: string) {
		this._messages = this._messages.filter(m => m.timestamp + 10_0000 > Date.now())
		this._messages.push({value: message, timestamp: Date.now()})
	}
}