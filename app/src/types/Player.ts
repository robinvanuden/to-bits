import {names, uniqueNamesGenerator} from "unique-names-generator"
import PowerUp, {PowerType, PowerUpModel} from "./PowerUp"
import Boomerang, {BoomerangModel} from "./boomerang"
import {v4} from "uuid"
import Fireball, {FireballModel} from "./fireball"
import {Tile} from "./Tile"
import {GRAVITY} from "../constants"

const randomName = () => uniqueNamesGenerator({length: 1, dictionaries: [names]})

const randomColor = () => `hsl(${Math.round(360 * Math.random())}, 74%, 58%)`

const randomMask = () => Math.round(Math.random() * 3) + 1

const PLAYER_WIDTH = 39
const PLAYER_HEIGHT = 48
const SPEED_WALK = 4
const SPEED_JUMP = 7.7
const MAX_POWER_UP = 5

export class Player {
  id: string // ID
  socket_id: string
  disconnected: number | undefined // is disconnected
  died: number | undefined
  color: string // color
  mask: number // mask
  name: string // name
  sw: number // speed walking
  sj: number // speed falling
  width: number // width
  height: number // height
  x: number // x-coord
  y: number // y-coord
  vx: number // x velocity
  vy: number // y velocity
  gravity: number // gravity
  falling: boolean
  look: Direction // directions looking
  move: Direction // directions pressed
  power_ups: PowerUp[] = []
  boomerangs: Boomerang[] = []
  fireballs: Fireball[] = []

  constructor(id: string, socket: string, spawn: Tile) {
    this.id = id
    this.socket_id = socket
    this.disconnected = undefined
    this.died = undefined
    this.color = randomColor()
    this.mask = randomMask()
    this.name = randomName()
    this.width = PLAYER_WIDTH
    this.height = PLAYER_HEIGHT
    this.x = spawn.x
    this.y = spawn.y
    this.vx = 0
    this.vy = 0
    this.gravity = GRAVITY
    this.falling = false
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
    this.boomerangs = []
    this.fireballs = []
    this.power_ups = []
  }

  canJump = (): boolean => !this.falling && this.vy >= 0 && this.vy < 1

  // +1 checks 1 row of pixels below player
  hasPowerUp = (type: PowerType): boolean => this.power_ups.filter(p => p.type === type).length > 0

  addPowerUp = (power_up: PowerUp): boolean => {
    if (this.power_ups.length >= MAX_POWER_UP) {
      return false
    }
    this.power_ups.push(power_up)
    return true
  }

  recreate = (socket: string) => {
    this.socket_id = socket
    this.disconnected = undefined
    this.move = {u: false, d: false, l: false, r: false}
  }

  respawn = (spawn: Tile) => {
    this.died = undefined
    this.x = spawn.x
    this.y = spawn.y
    this.gravity = GRAVITY
    this.look = {u: false, d: false, l: false, r: true}
    this.fireballs = []
    this.boomerangs = []
  }

  kill = () => {
    this.died = Date.now()
    this.vx = 0
    this.vy = 0
    this.gravity = 0
    this.move = {u: false, d: false, l: false, r: false}
    this.power_ups = []
  }

  getFirstPowerUp = () => this.power_ups[0] || null

  usePowerUp = (type: PowerType) => {
    const power_up = this.power_ups.find(p => p.type === type)
    if (!power_up) {
      return
    }
    this.power_ups = this.power_ups.filter(p => p.id !== power_up.id)
  }

  throwBoomerang = (degrees: number) => {
    const radians = (degrees * Math.PI) / 180
    this.boomerangs.push(new Boomerang(v4(), this, radians))
  }

  breakBoomerang = (boomerang: Boomerang) => {
    this.boomerangs = this.boomerangs.filter(b => b.id !== boomerang.id)
  }

  throwFireball = (degrees: number) => {
    const radians = (degrees * Math.PI) / 180
    this.fireballs.push(new Fireball(v4(), this, radians))
  }

  breakFireball = (fireball: Fireball) => {
    this.fireballs = this.fireballs.filter(b => b.id !== fireball.id)
  }

  static toModel = (p: Player): PlayerM => ({
    i: p.socket_id,
    uid: p.id,
    w: p.width,
    h: p.height,
    x: p.x,
    y: p.y,
    vx: p.vx,
    vy: p.vy,
    d: p.died,
    dc: p.disconnected,
    n: p.name,
    c: p.color,
    l: p.look,
    m: p.move,
    pu: p.power_ups.map(PowerUp.toModel),
    br: p.boomerangs.map(Boomerang.toModel),
    fb: p.fireballs.map(Fireball.toModel)
  })
}

export interface Direction {
  u: boolean // up
  d: boolean // down
  l: boolean // left
  r: boolean // right
}

export interface PlayerM {
  i: string,
  uid: string
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
  pu: PowerUpModel[]
  br: BoomerangModel[]
  fb: FireballModel[]
}