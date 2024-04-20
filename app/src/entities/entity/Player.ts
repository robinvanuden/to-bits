import {names, uniqueNamesGenerator} from "unique-names-generator"
import PowerUp, {PowerType} from "../PowerUp"
import MapTile from "../../world/MapTile"
import {GRAVITY} from "../../constants"
import PlayerModel, {Direction} from "../../types/model/PlayerModel"
import Entity from "../Entity"
import HitBox from "./HitBox"

const PLAYER_TIMEOUT = 10_000

const PLAYER_WIDTH = 13
const PLAYER_HEIGHT = 16
const PLAYER_SPEED_WALK = 2
const PLAYER_SPEED_JUMP = 4
const PLAYER_MAX_POWER_UP = 5
export const PLAYER_MAX_HEALTH = 100
export const PLAYER_DAMAGE = PLAYER_MAX_HEALTH * .30
export const PLAYER_GRAVITY = GRAVITY

const randomName = () => uniqueNamesGenerator({length: 1, dictionaries: [names]})

const randomColor = () => `hsl(${Math.round(360 * Math.random())}, 74%, 58%)`

const randomMask = () => Math.round(Math.random() * 3) + 1

export default class Player extends Entity {
	// ID
	private socket_id: string
	private readonly name: string
	public readonly color: string
	public readonly mask: number
	public speedWalking: number
	public speedJumping: number

	public vx: number
	public vy: number

	public gravity: number
	public grounded: boolean

	private healthPoints: number
	private readonly healthPointsMax: number

	private timeDisconnected: number
	private timeDied: number
	private timeDamaged: number

	private timeSwung: number
	private damagePoints: number
	private readonly damagePointsDefault: number

	public look: Direction
	public move: Direction

	private power_ups: PowerUp[] = []

	constructor(id: string, socket: string, spawn: MapTile) {
		super(spawn.x, spawn.y, PLAYER_WIDTH, PLAYER_HEIGHT, id)

		this.socket_id = socket
		this.timeDisconnected = -1
		this.timeDied = -1
		this.timeDamaged = -1
		this.healthPointsMax = PLAYER_MAX_HEALTH
		this.healthPoints = this.healthPointsMax
		this.damagePoints = PLAYER_DAMAGE
		this.damagePointsDefault = PLAYER_DAMAGE
		this.timeSwung = 0
		this.color = randomColor()
		this.mask = randomMask()
		this.name = randomName()

		this.vx = 0
		this.vy = 0
		this.gravity = PLAYER_GRAVITY
		this.grounded = false
		this.speedWalking = PLAYER_SPEED_WALK
		this.speedJumping = PLAYER_SPEED_JUMP
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

	isAlive = (): boolean => this.timeDied < 0

	// +1 checks 1 row of pixels below player_id
	canJump = (): boolean => this.grounded && this.vy >= 0 && this.vy < 1

	public addPowerUp = (power_up: PowerUp | undefined): boolean => {
		if (!power_up) {
			return false
		}
		if (power_up.type === PowerType.HEALTH) {
			this.heal(this.healthPointsMax * .25)
			return true
		}
		if (this.power_ups.length >= PLAYER_MAX_POWER_UP) {
			return false
		}
		this.power_ups.push(power_up)
		return true
	}

	getFirstPowerUp = () => this.power_ups[0] || undefined

	usePowerUp = (power: PowerUp) => {
		const power_up = this.power_ups.find(power.equals)
		if (!power_up) {
			return
		}
		power_up.usePower()
		if (power_up.uses > 0) {
			return
		}
		this.resetDamagePoints()
		this.power_ups = this.power_ups.filter(power.notEquals)
	}

	respawn = (spawn: Entity) => {
		this.timeDied = -1
		this.healthPoints = this.healthPointsMax
		this.x = spawn.x
		this.y = spawn.y
		this.gravity = PLAYER_GRAVITY
		this.look = {u: false, d: false, l: false, r: true}
	}

	private kill = () => {
		this.timeDied = this.getNow()
		this.healthPoints = 0
		this.vx = 0
		this.vy = 0
		this.gravity = 0
		this.move = {u: false, d: false, l: false, r: false}
		// Clear items
		this.power_ups = []
	}

	heal = (damage: number) => {
		this.healthPoints += damage
		if (this.healthPoints >= this.healthPointsMax) this.healthPoints = this.healthPointsMax
	}

	damage = (damage: number) => {
		this.timeDamaged = this.getNow()
		this.healthPoints -= Math.max(damage, 0)
		if (this.healthPoints <= 0) this.kill()
	}

	damageFall = (vy: number) => {
		const part = -7 + vy
		const damage = Math.ceil(part / this.healthPointsMax * 100)
		if (damage <= 0) {
			return
		}
		this.damage(damage)
	}

	hits = (player: Player) => {
		if (this.isSwung() && player.isAlive() && player.collidesWith(this.hit_box())) {
			console.log("swung", this.damagePoints)
			this.timeSwung = 0
			player.damage(this.damagePoints)
			const power = this.getFirstPowerUp()
			if (power) {
				switch (power.type) {
				case PowerType.HAMMER:
				case PowerType.SWORD:
					this.resetDamagePoints()
					this.usePowerUp(power)
					break
				}
			}
		}
	}

	hit_box = (): HitBox => {
		const width = Math.round(this.width * .5)
		const height = this.height
		const x = this.look.l ? this.x - width : this.x + this.width
		const y = this.y
		return new HitBox(x, y, width, height)
	}

	isSwung = () => this.getNow() - 150 < this.timeSwung

	doSwing = () => this.timeSwung = this.getNow()

	setDamagePoints = (number: number) => {
		this.damagePoints = this.damagePoints * number
	}

	resetDamagePoints = () => this.damagePoints = this.damagePointsDefault

	isWalkingOn = (tile: MapTile): boolean =>
		this.isWithinX(tile) &&
		tile.y - 1 < this.y + this.height &&
		tile.y + tile.height > this.y + (this.height - 1)

	isTouching = (tile: MapTile) => tile.power_up && this.collidesWith(tile)

	isRespawnAble = () => this.timeDied >= 0 && this.timeDisconnected < 0 && this.isBeforeNow(this.timeDied + 5000)

	toModel = (): PlayerModel => ({
		i: this.socket_id,
		uid: this.id,
		n: this.name,
		c: this.color,
		hp: this.healthPoints,
		w: this.width,
		h: this.height,
		x: this.x,
		y: this.y,
		tdm: this.timeDamaged,
		tod: this.timeDied,
		tdc: this.timeDisconnected,
		l: this.look,
		m: this.move,
		pu: this.power_ups.map(p => p.toModel())
	})

	isConnected = () => this.timeDisconnected < 0

	isTimedOut = () => this.timeDisconnected >= 0 && this.isNowOrBefore(this.timeDisconnected + PLAYER_TIMEOUT)

	isDangling = () => this.timeDisconnected >= 0 && this.isAfterNow(this.timeDisconnected + PLAYER_TIMEOUT)

	reconnect = (socket_id: string) => {
		console.log("Reconnected", socket_id)
		this.socket_id = socket_id
		this.timeDisconnected = -1
		this.move = {u: false, d: false, l: false, r: false}
	}

	disconnect = () => {
		this.socket_id = ""
		this.timeDisconnected = this.getNow()
		this.move = {u: false, d: false, l: false, r: false}
	}
}