import {names, uniqueNamesGenerator} from "unique-names-generator"
import PowerUp, {PowerType} from "./PowerUp"
import Boomerang from "./projectiles/Boomerang"
import {v4} from "uuid"
import Fireball from "./projectiles/Fireball"
import MapTile from "./MapTile"
import {GRAVITY} from "../constants"
import {Direction, PlayerModel} from "../types/PlayerModel"

const randomName = () => uniqueNamesGenerator({length: 1, dictionaries: [names]})

const randomColor = () => `hsl(${Math.round(360 * Math.random())}, 74%, 58%)`

const randomMask = () => Math.round(Math.random() * 3) + 1

const PLAYER_WIDTH = 13
const PLAYER_HEIGHT = 16
const SPEED_WALK = 1.5
const SPEED_JUMP = 4
const MAX_POWER_UP = 5

export default class Player {
  // ID
  id: string
  socket_id: string
  // is disconnected
  disconnected: number | undefined
  died: number | undefined
  // color
  color: string
  // mask
  mask: number
  // name
  name: string
  // speed walking
  sw: number
  // speed falling
  sj: number
  // width
  width: number
  // height
  height: number
  // x-coord
  x: number
  // y-coord
  y: number
  // x velocity
  vx: number
  // y velocity
  vy: number
  // gravity
  gravity: number
  grounded: boolean
  // directions looking
  look: Direction
  // directions pressed
  move: Direction
  power_ups: PowerUp[] = []
  boomerangs: Boomerang[] = []
  fireballs: Fireball[] = []

  constructor(id: string, socket: string, spawn: MapTile) {
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
    this.grounded = false
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

  canJump = (): boolean => this.grounded && this.vy >= 0 && this.vy < 1

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

  respawn = (spawn: MapTile) => {
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

  static toModel = (p: Player): PlayerModel => ({
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