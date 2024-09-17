import {TileLayerModel} from "./model/TileModel"
import PlayerModel, {PlayerUpdateModel} from "./model/PlayerModel"
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

	setPlayers = (models: PlayerModel[]) => {
		this._players = []
		this._players.push(...models)
	}

	updatePlayers = (models: PlayerUpdateModel[]) => {
		for (const model of models) {
			for (const player of this._players) {
				if (player.uid === model.uid) {
					player.uid = model.uid
					player.x = model.x
					player.y = model.y
					player.vx = model.vx
					player.vy = model.vy
					player.hp = model.hp
					player.hpm = model.hpm
					player.dmg = model.dmg
					player.l = model.l
					player.m = model.m
					player.pu = model.pu
					player.ps = model.ps
				}
			}
		}
	}

	addPlayer = (player: PlayerModel) => {
		this._players = this._players.filter(p => p.uid !== player.uid)
		this._players.push(player)
	}

	removePlayer = (uid: string) => {
		this._players = this._players.filter(p => p.uid !== uid)
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