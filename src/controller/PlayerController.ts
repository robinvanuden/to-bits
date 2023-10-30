import Tile from "../types/Tile"
import {Player} from "../types/Player"

export default class PlayerController {

  players: Player[] = []

  list = () => this.players

  filled = () => this.players.length > 0

  alive = () => this.players.filter(p => p.died === undefined)

  disconnected = () => this.players.filter(p => p.disconnected != undefined && (p.disconnected + 10_000) < Date.now())

  respawns = () => this.players.filter(p => p.died != undefined && p.disconnected == undefined && (p.died + 5000) < Date.now())

  create = (spawn: Tile, id: string, socket: string) => this.players.push(new Player(id, socket, spawn))

  remove = (player: Player) => this.players = this.players.filter(p => p.id !== player.id)

  get = (id: string) => this.players.find(player => player.id === id) ?? null

  getConnected = (id: string) => this.players.find(player => player.id === id && player.disconnected !== undefined) ?? null
}