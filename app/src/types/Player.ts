import Tile from "./Tile"
import {GRAVITY} from "../constants"
import {names, uniqueNamesGenerator} from "unique-names-generator"
import PowerUp, {PowerType, PowerUpModel} from "./PowerUp"
import Boomerang, {BoomerangModel} from "./boomerang"
import {v4} from "uuid"
import Fireball, {FireballModel} from "./fireball"

const randomName = () => uniqueNamesGenerator({length: 1, dictionaries: [names]})

const randomColor = (hue: number) => `hsl(${hue}, 68%, 62%)`

const randomHeu = () => Math.round(360 * Math.random())

const PLAYER_WIDTH = 36
const PLAYER_HEIGHT = 48
const SPEED_WALK = 5
const SPEED_JUMP = 7.5 // 7.7
const MAX_POWER_UP = 3

export class Player {
  id: string // ID
  socket: string
  disconnected: number | undefined // is disconnected
  died: number | undefined
  hue: number
  color: string // color
  name: string // name
  gravity: number // gravity
  sw: number // speed walking
  sj: number // speed falling
  width: number // width
  height: number // height
  x: number // x-coord
  y: number // y-coord
  vx: number // x velocity
  vy: number // y velocity
  falling: boolean
  look: Direction // directions looking
  move: Direction // directions pressed
  power_ups: PowerUp[] = []
  boomerangs: Boomerang[] = []
  fireballs: Fireball[] = []

  constructor(id: string, socket: string, spawn: Tile) {
    this.id = id
    this.socket = socket
    this.disconnected = undefined
    this.died = undefined
    this.hue = randomHeu()
    this.color = randomColor(this.hue)
    this.name = randomName()
    this.width = PLAYER_WIDTH
    this.height = PLAYER_HEIGHT
    this.x = spawn.x
    this.y = spawn.y
    this.vx = 0
    this.vy = 0
    this.falling = false
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
    this.boomerangs = []
    this.fireballs = []
    this.power_ups = []
  }

  canJump = (): boolean => !this.falling && this.vy >= 0 && this.vy < 1

  // +1 checks 1 row of pixels below player
  hasPowerUp = (power_up: PowerType): boolean => this.power_ups.filter(p => p.type === power_up).length > 0

  addPowerUp = (power_up: PowerUp): boolean => {
    if (this.power_ups.length >= MAX_POWER_UP) {
      return false
    }
    this.power_ups.push(power_up)
    return true
  }

  recreate = (socket: string) => {
    this.socket = socket
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

  static toModel = (player: Player): PlayerM => ({
    i: player.socket,
    w: player.width,
    h: player.height,
    x: player.x,
    y: player.y,
    vx: player.vx,
    vy: player.vy,
    d: player.died,
    dc: player.disconnected,
    n: player.name,
    c: player.color,
    ch: player.hue,
    l: player.look,
    m: player.move,
    pu: player.power_ups.map(PowerUp.toModel),
    br: player.boomerangs.map(Boomerang.toModel),
    fb: player.fireballs.map(Fireball.toModel)
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
  ch: number // hue
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