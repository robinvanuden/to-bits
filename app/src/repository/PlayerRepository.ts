import Player from "../entities/entity/Player"
import MapTile from "../world/MapTile"

export default class PlayerRepository {

	players: Player[] = []

	list = () => this.players

	filled = () => this.players.length > 0

	alive = () => this.players.filter(p => p.isAlive())

	disconnected = () => this.players.filter(p => p.isTimedOut())

	respawns = () => this.players.filter(p => p.isRespawnAble())

	create = (spawn: MapTile, id: string, socket: string) => this.players.push(new Player(id, socket, spawn))

	remove = (player: Player) => this.players = this.players.filter(p => p.id !== player.id)

	getById = (id: string) => this.players.find(p => p.id === id) ?? null

	getConnected = (id: string) => this.players.find(player => player.id === id && player.isDangling()) ?? null

	othersAlive = (player: Player) => this.players.filter(p => p.id !== player.id && player.isAlive())
}