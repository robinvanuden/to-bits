import {names, uniqueNamesGenerator} from "unique-names-generator"
import PowerUp from "./PowerUp"
import MapTile from "./MapTile"
import {
	PLAYER_GRAVITY,
	PLAYER_HEIGHT,
	PLAYER_MAX_POWER_UP,
	PLAYER_SPEED_JUMP,
	PLAYER_SPEED_WALK,
	PLAYER_WIDTH
} from "../constants"
import PlayerModel, {Direction} from "../types/PlayerModel"

const randomName = () => uniqueNamesGenerator({length: 1, dictionaries: [names]})

const randomColor = () => `hsl(${Math.round(360 * Math.random())}, 74%, 58%)`

const randomMask = () => Math.round(Math.random() * 3) + 1


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

	isColliding = (tile: MapTile): boolean =>
		tile.x < this.x + this.width &&
		tile.x + tile.width > this.x &&
		tile.y < this.y + this.height &&
		tile.y + tile.height > this.y

	isWalkingOn = (tile: MapTile): boolean =>
		tile.x < this.x + this.width &&
		tile.x + tile.width > this.x &&
		tile.y - 1 < this.y + this.height &&
		tile.y + tile.height > this.y + (this.height - 1)

	isTouching = (tile: MapTile) =>
		tile.power_up &&
		tile.x < this.x + this.width &&
		tile.x + tile.width > this.x &&
		tile.y < this.y + this.height &&
		tile.y + tile.height > this.y

	getFirstPowerUp = () => this.power_ups[0] || undefined

	usePowerUp = (power: PowerUp) => {
		const power_up = this.power_ups.find(power.equals)
		if (!power_up) {
			return
		}
		this.power_ups = this.power_ups.filter(power.notEquals)
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
		pu: p.power_ups.map(PowerUp.toModel)
	})
}