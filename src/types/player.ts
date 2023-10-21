import Tile from "./tile"
import {GRAVITY} from "../constants"
import {names, uniqueNamesGenerator} from "unique-names-generator"

const randomName = () => uniqueNamesGenerator({length: 1, dictionaries: [names]})

const randomColor = () => `hsl(${360 * Math.random()}, 88%, 62%)`

const PLAYER_WIDTH = 36
const PLAYER_HEIGHT = 48
const SPEED_WALK = 5
const SPEED_JUMP = 7.5 // 7.7

export enum PowerUp {BOOMERANG, BOMB, FIREBALL}

export class Player {
  id: string // ID
  socket: string
  disconnected: number | undefined // is disconnected
  died: number | undefined
  color: string // color
  name: string // name
  gravity: number // gravity
  sw: number // speed walking
  sj: number // speed falling
  w: number // width
  h: number // height
  x: number // x-coord
  y: number // y-coord
  vx: number // x velocity
  vy: number // y velocity
  look: Direction // directions looking
  move: Direction // directions pressed
  power_ups: PowerUp[] = []

  constructor(id: string, socket: string, spawn: Tile) {
    this.id = id
    this.socket = socket
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

  canJump = (): boolean => this.vy >= 0 && this.vy < 1

  // +1 checks 1 row of pixels below player
  hasPowerUp = (power_up: PowerUp): boolean => this.power_ups.indexOf(power_up) !== -1

  static toModel = (player: Player): PlayerM => ({
    i: player.socket,
    w: player.w,
    h: player.h,
    x: player.x,
    y: player.y,
    vx: player.vx,
    vy: player.vy,
    d: player.died,
    dc: player.disconnected,
    n: player.name,
    c: player.color,
    l: player.look,
    m: player.move
  })
}

export interface Direction {
  u: boolean // up
  d: boolean // down
  l: boolean // left
  r: boolean // right
}

export interface PlayerM {
  i: string
  n: string // name
  c: string // color
  w: number // width
  h: number // height
  x: number // x-coord
  y: number // y-coord
  vx: number // x velocity
  vy: number // y velocity
  d: number | undefined // died
  dc: number | undefined // disconnected
  l: Direction
  m: Direction
}