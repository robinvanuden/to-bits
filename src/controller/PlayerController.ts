import Tile from "../types/tile"
import {Player} from "../types/player"
import {GRAVITY} from "../constants"

export default class PlayerController {

  players: Player[] = []

  list = () => this.players

  filled = () => this.players.length > 0

  alive = () => this.players.filter(p => p.died === undefined)

  disconnected = () => this.players.filter(p => p.disconnected != undefined && (p.disconnected + 10_000) < Date.now())

  respawns = () => this.players.filter(p => p.died != undefined && p.disconnected == undefined && (p.died + 5000) < Date.now())

  create = (spawn: Tile, id: string, socket: string) => this.players.push(new Player(id, socket, spawn))

  recreate = (player: Player, socket: string) => {
    player.socket = socket
    player.disconnected = undefined
    player.move = {u: false, d: false, l: false, r: false}
  }

  respawn = (player: Player, spawn: Tile) => {
    player.died = undefined
    player.x = spawn.x
    player.y = spawn.y
    player.gravity = GRAVITY
    player.look = {u: false, d: false, l: false, r: true}
    return player
  }

  kill = (player: Player) => {
    player.died = Date.now()
    player.vx = 0
    player.vy = 0
    player.gravity = 0
    player.move = {u: false, d: false, l: false, r: false}
  }

  remove = (player: Player) => this.players = this.players.filter(p => p.id !== player.id)

  get = (id: string) => this.players.find(player => player.id === id) ?? null

  getConnected = (id: string) => this.players.find(player => player.id === id && player.disconnected !== undefined) ?? null

  isConnected = (id: string) => this.players.filter(player => player.id === id && player.disconnected === undefined).length > 0

}