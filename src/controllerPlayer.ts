import {Tile} from "./types/map"
import {Player} from "./types/player"
import {GRAVITY} from "./constants"

const TILE_PLAYER = 24
const SPEED_WALK = 5
const SPEED_JUMP = 7.5 // 7.7

const NAMES = [
  "Alfa", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf",
  "Hotel", "India", "Juliett", "Kilo", "Lima", "Mike", "November", "Oscar", "Papa",
  "Quebec", "Romeo", "Sierra", "Tango", "Uniform", "Victor", "Whiskey", "X-ray", "Yankee", "Zulu"
]

const randomName = () => NAMES[Math.round((NAMES.length - 1) * Math.random())]

const randomColor = () => `hsl(${360 * Math.random()}, 88%, 62%)`

export const createPlayer = (spawn: Tile, id: string, address: string): Player => {
  return {
    id: id,
    address: address,
    connected: true,
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
  }
}

export const respawnPlayer = (player: Player, spawn: Tile) => {
  player.alive = true
  player.x = spawn.x
  player.y = spawn.y
  player.direction = {
    u: false,
    d: false,
    l: false,
    r: false
  }
  return player
}

