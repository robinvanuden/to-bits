import {Tile} from "./tile"
import {GRAVITY} from "../constants"
import {names, uniqueNamesGenerator} from "unique-names-generator"

const randomName = () => uniqueNamesGenerator({length: 1, dictionaries: [names]})

const randomColor = () => `hsl(${360 * Math.random()}, 88%, 62%)`

const PLAYER_WIDTH = 36
const PLAYER_HEIGHT = 48
const SPEED_WALK = 5
const SPEED_JUMP = 8.3 // 7.5 // 7.7

export class Player {
  id: string // ID
  disconnected: number | undefined // is disconnected
  died: number | undefined
  color: string // color
  name: string // name
  gravity: number // gravity
  sw: number // speed walking
  sj: number // speed jumping
  w: number // width
  h: number // height
  x: number // x-coord
  y: number // y-coord
  vx: number // x velocity
  vy: number // y velocity
  jumping: boolean
  look: Direction // directions looking
  move: Direction // directions pressed

  constructor(id: string, spawn: Tile) {
    this.id = id
    this.disconnected = undefined
    this.died = undefined
    this.color = randomColor()
    this.name = randomName()
    this.w = PLAYER_WIDTH
    this.h = PLAYER_HEIGHT
    this.x = spawn.x
    this.y = spawn.y
    this.vx = 0
    this.vy = 0
    this.gravity = GRAVITY
    this.sw = SPEED_WALK
    this.sj = SPEED_JUMP
    this.jumping = false
    this.look = {
      u: false,
      d: false,
      l: false,
      r: false
    }
    this.move = {
      u: false,
      d: false,
      l: false,
      r: false
    }
  }

  isColliding = (t: Tile): boolean => {
    return this.x < t.x + t.w && this.x + this.w > t.x && this.y < t.y + t.h && this.y + this.h > t.y
  }

  isWalkingOn = (t: Tile): boolean => {
    // +1 checks 1 row of pixels below player
    return this.x < t.x + t.w && this.x + this.w > t.x && this.y < t.y + t.h && this.y + this.h + 1 > t.y
  }
}

export interface Direction {
  u: boolean // up
  d: boolean // down
  l: boolean // left
  r: boolean // right
}