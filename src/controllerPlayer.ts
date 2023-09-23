import {Tile} from "./types/map"
import {Player} from "./types/player"

const TILE_PLAYER = 24
const GRAVITY = 0.00982
const SPEED_WALK = 5
const SPEED_JUMP = 12

const NAMES = [
  "Alfa", "Bravo", "Charlie", "Delta", "Echo", "Foxtrot", "Golf",
  "Hotel", "India", "Juliett", "Kilo", "Lima", "Mike", "November", "Oscar", "Papa",
  "Quebec", "Romeo", "Sierra", "Tango", "Uniform", "Victor", "Whiskey", "X-ray", "Yankee", "Zulu"
]

const randomName = () => NAMES[Math.round((NAMES.length - 1) * Math.random())]

const randomNames = () => randomName() + " " + randomName()

const randomColor = () => "#" + Math.floor(Math.random() * 16777215).toString(16)

export const createPlayer = (spawn: Tile, id: string, address: string): Player => {
  return {
    id: id,
    address: address,
    connected: true,
    color: randomColor(),
    name: randomNames(),
    w: TILE_PLAYER,
    h: TILE_PLAYER * 1.5,
    x: spawn.x,
    y: spawn.y,
    vx: 0,
    vy: 0,
    gravity: GRAVITY,
    speed_walk: SPEED_WALK,
    speed_jump: SPEED_JUMP,
    canJump: true,
    direction: {
      u: false,
      d: false,
      l: false,
      r: false
    }
  }
}