import {Tile} from "./types/map"
import {Player} from "./types/player"
import {GRAVITY} from "./constants"
import {names, uniqueNamesGenerator} from 'unique-names-generator'


const PLAYER_WIDTH = 24
const PLAYER_HEIGHT = 24
const SPEED_WALK = 5
const SPEED_JUMP = 7.5 // 7.7

const randomName = () => uniqueNamesGenerator({length: 1, dictionaries: [names]})

const randomColor = () => `hsl(${360 * Math.random()}, 88%, 62%)`

export const createPlayer = (spawn: Tile, id: string): Player => ({
  id: id,
  disconnected: undefined,
  died: undefined,
  color: randomColor(),
  name: randomName(),
  w: PLAYER_WIDTH,
  h: PLAYER_HEIGHT,
  x: spawn.x,
  y: spawn.y,
  vx: 0,
  vy: 0,
  gravity: GRAVITY,
  sw: SPEED_WALK,
  sj: SPEED_JUMP,
  arial: false,
  move: {
    u: false,
    d: false,
    l: false,
    r: false
  },
  boomerangs: []
})

export const killPlayer = (player: Player) => {
  player.died = Date.now()
  player.vx = 0
  player.vy = 0
  player.gravity = 0
  player.boomerangs = []
}

export const respawnPlayer = (player: Player, spawn: Tile) => {
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

