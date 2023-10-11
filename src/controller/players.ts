import {Tile} from "../types/tile"
import {Player} from "../types/player"
import {GRAVITY} from "../constants"
import {names, uniqueNamesGenerator} from 'unique-names-generator'


const PLAYER_WIDTH = 48
const PLAYER_HEIGHT = 64
const SPEED_WALK = 5
const SPEED_JUMP = 10.4 // 7.5 // 7.7

const randomName = () => uniqueNamesGenerator({length: 1, dictionaries: [names]})

const randomColor = () => `hsl(${360 * Math.random()}, 88%, 62%)`

export default class Players {

  players: Player[] = []

  list = () => this.players

  filled = () => this.players.length > 0

  alive = () => this.players.filter(p => p.died === undefined)

  disconnected = () => this.players.filter(p => p.disconnected != undefined && (p.disconnected + 10_000) < Date.now())

  respawns = () => this.players.filter(p => p.died != undefined && (p.died + 5000) < Date.now())

  create = (spawn: Tile, id: string) => {
    const player = new Player()
    player.id = id
    player.disconnected = undefined
    player.died = undefined
    player.color = randomColor()
    player.name = randomName()
    player.w = PLAYER_WIDTH
    player.h = PLAYER_HEIGHT
    player.x = spawn.x
    player.y = spawn.y
    player.vx = 0
    player.vy = 0
    player.gravity = GRAVITY
    player.sw = SPEED_WALK
    player.sj = SPEED_JUMP
    player.arial = false
    player.move = {
      u: false,
      d: false,
      l: false,
      r: false
    }
    player.boomerangs = []
    this.players.push(player)
    return player
  }

  respawn = (player: Player, spawn: Tile) => {
    player.died = undefined
    player.x = spawn.x
    player.y = spawn.y
    player.gravity = GRAVITY
    player.move = {
      u: false,
      d: false,
      l: false,
      r: false
    }
    return player
  }

  kill = (player: Player) => {
    player.died = Date.now()
    player.vx = 0
    player.vy = 0
    player.gravity = 0
    player.boomerangs = []
  }

  remove = (player: Player) => this.players = this.players.filter(p => p.id !== player.id)

  get = (id: string) => this.players.find(player => player.id === id) ?? null

  getConnected = (id: string) => this.players.find(player => player.id === id && player.disconnected !== undefined) ?? null

  isConnected = (id: string) => this.players.filter(player => player.id === id && player.disconnected === undefined).length > 0

}