import {names, uniqueNamesGenerator} from "unique-names-generator"
import PowerUp from "../PowerUp"
import MapTile from "../../world/MapTile"
import {GRAVITY} from "../../constants"
import PlayerModel, {Direction} from "../../types/PlayerModel"
import Entity from "../Entity"

export const PLAYER_WIDTH = 13
export const PLAYER_HEIGHT = 16
export const PLAYER_SPEED_WALK = 2
export const PLAYER_SPEED_JUMP = 4
export const PLAYER_MAX_POWER_UP = 5
export const PLAYER_GRAVITY = GRAVITY

const randomName = () => uniqueNamesGenerator({length: 1, dictionaries: [names]})

const randomColor = () => `hsl(${Math.round(360 * Math.random())}, 74%, 58%)`

const randomMask = () => Math.round(Math.random() * 3) + 1

export default class Player extends Entity {
	// ID
	socket_id: string
	disconnected: number | undefined
	died: number | undefined
	color: string
	mask: number
	name: string
	sw: number
	sj: number

	vx: number
	vy: number

	gravity: number
	grounded: boolean

	look: Direction
	move: Direction

	power_ups: PowerUp[] = []

	constructor(id: string, socket: string, spawn: MapTile) {
		super(spawn.x, spawn.y, PLAYER_WIDTH, PLAYER_HEIGHT, id)

		this.socket_id = socket
		this.disconnected = undefined
		this.died = undefined
		this.color = randomColor()
		this.mask = randomMask()
		this.name = randomName()

		this.vx = 0
		this.vy = 0
		this.gravity = PLAYER_GRAVITY
		this.grounded = false
		this.sw = PLAYER_SPEED_WALK
		this.sj = PLAYER_SPEED_JUMP
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
		this.power_ups = []
	}

	isAlive = (): boolean => this.died == undefined

	// +1 checks 1 row of pixels below player_id
	canJump = (): boolean => this.grounded && this.vy >= 0 && this.vy < 1

	addPowerUp = (power_up: PowerUp | undefined): boolean => {
		if (!power_up || this.power_ups.length >= PLAYER_MAX_POWER_UP) {
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
		this.gravity = PLAYER_GRAVITY
		this.look = {u: false, d: false, l: false, r: true}
	}

	kill = () => {
		this.died = Date.now()
		this.vx = 0
		this.vy = 0
		this.gravity = 0
		this.move = {u: false, d: false, l: false, r: false}
		// Clear items
		this.power_ups = []
	}

	isWalkingOn = (tile: MapTile): boolean =>
		this.isWithinX(tile) &&
		tile.y - 1 < this.y + this.height &&
		tile.y + tile.height > this.y + (this.height - 1)

	isTouching = (tile: MapTile) => tile.power_up && this.collidesWith(tile)

	getFirstPowerUp = () => this.power_ups[0] || undefined

	usePowerUp = (power: PowerUp) => {
		const power_up = this.power_ups.find(power.equals)
		if (!power_up) {
			return
		}
		this.power_ups = this.power_ups.filter(power.notEquals)
	}

	toModel = (): PlayerModel => ({
		i: this.socket_id,
		uid: this.id,
		w: this.width,
		h: this.height,
		x: this.x,
		y: this.y,
		vx: this.vx,
		vy: this.vy,
		d: this.died,
		dc: this.disconnected,
		n: this.name,
		c: this.color,
		l: this.look,
		m: this.move,
		pu: this.power_ups.map(PowerUp.toModel)
	})
}