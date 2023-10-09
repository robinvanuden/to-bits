import {Tile} from "./types/map"
import {Player} from "./types/player"
import {GRAVITY} from "./constants"
import {names, uniqueNamesGenerator} from 'unique-names-generator'


const TILE_PLAYER = 24
const SPEED_WALK = 5
const SPEED_JUMP = 7.5 // 7.7

const randomName = (): string => uniqueNamesGenerator({
  length: 1,
  dictionaries: [names]
})

const randomColor = () => `hsl(${360 * Math.random()}, 88%, 62%)`

export const createPlayer = (spawn: Tile, id: string, address: string): Player => ({
  id: id,
  address: address,
  connected: true,
  disconnected: undefined,
  alive: true,
  color: randomColor(),
  name: randomName(),
  w: TILE_PLAYER,
  h: TILE_PLAYER,
  x: spawn.x,
  y: spawn.y,
  vx: 0,
  vy: 0,
  gravity: GRAVITY,
  speed_walk: SPEED_WALK,
  speed_jump: SPEED_JUMP,
  canJump: false,
  direction: {
    u: false,
    d: false,
    l: false,
    r: false
  },
  boomerangs: []
})

export const killPlayer = (player: Player, spawn: Tile) => {
  player.alive = false
  player.vy = 0
  player.gravity = 0
  player.boomerangs = []
  setTimeout(() => respawnPlayer(player, spawn), 3000)
}

export const respawnPlayer = (player: Player, spawn: Tile) => {
  player.alive = true
  player.x = spawn.x
  player.y = spawn.y
  player.gravity = GRAVITY
  player.direction = {
    u: false,
    d: false,
    l: false,
    r: false
  }
  return player
}

