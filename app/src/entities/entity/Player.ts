import PowerUp, {PowerType} from "../PowerUp"
import MapTile from "../../world/MapTile"
import {GRAVITY} from "../../constants"
import PlayerModel, {Direction, PlayerUpdateModel} from "../../types/model/PlayerModel"
import Entity from "../Entity"
import HitBox from "./HitBox"
import Damage, {DamageCause, DamageContext, damageToModel} from "./Damage"
import {getNow} from "../../game"

const PLAYER_TIMEOUT = 10_000

const PLAYER_WIDTH = 13
const PLAYER_HEIGHT = 16
const PLAYER_SPEED_WALK = 2
const PLAYER_SPEED_JUMP = 4
const PLAYER_MAX_POWER_UP = 3
const PLAYER_MAX_HEALTH = 100
const PLAYER_DAMAGE = PLAYER_MAX_HEALTH * .30
const PLAYER_GRAVITY = GRAVITY

export default class Player extends Entity {

	// ID
	private socket_id: string
	public readonly name: string
	public readonly color: string
	public readonly mask: number
	public speedWalking: number
	public speedJumping: number

	public vx: number
	public vy: number

	public gravity: number
	public grounded: boolean
	public interact: boolean

	private healthPoints: number
	private readonly healthPointsMax: number

	private timeDisconnected: number
	private timeDied: number
	private damageTaken: Damage | undefined

	get timeWasDead() {
		return this.timeDied
	}

	private hitTime: number
	private readonly hitPoints: number

	public look: Direction
	public _move: Direction
	public _moveTime: number

	get move() {
		return this._move
	}

	private power_ups: PowerUp[] = []
	private power_selected: number = 0

	constructor(id: string, socket: string, name: string, color: string, mask: number, spawn: MapTile) {
		super(spawn.x, spawn.y, PLAYER_WIDTH, PLAYER_HEIGHT, id)

		this.socket_id = socket
		this.timeDisconnected = -1
		this.timeDied = -1
		this.damageTaken = undefined
		this.healthPointsMax = PLAYER_MAX_HEALTH
		this.healthPoints = this.healthPointsMax
		this.hitPoints = PLAYER_DAMAGE
		this.hitTime = 0
		this.color = color
		this.mask = mask
		this.name = name

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
			r: true
		}
		this._move = {u: false, d: false, l: false, r: false}
		this._moveTime = getNow()
		this.interact = false
		this.power_ups = []
	}

	public setMove(direction: Direction) {
		this._move = direction
		this._moveTime = getNow()
	}

	get uid(): string {
		return this.socket_id
	}

	isAlive = (): boolean => this.timeDied < 0

	hasMoved = (): boolean => this._moveTime + 1000 > getNow()

	hasPowerUps = (): boolean => this.power_ups.length > 0

	itemIndex = (index: number) => {
		this.power_selected = index
		if (this.power_selected > PLAYER_MAX_POWER_UP) {
			this.power_selected = PLAYER_MAX_POWER_UP - 1
		} else if (this.power_selected < 0) {
			this.power_selected = 0
		}
	}

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

	getSelectedPowerUp = () => this.power_ups[this.power_selected] || undefined

	usePowerUp = (power: PowerUp) => {
		const power_up = this.power_ups.find(power.equals)
		if (!power_up) {
			return
		}
		power_up.usePower()
		if (power_up.uses > 0) {
			return
		}
		this.power_ups = this.power_ups.filter(power.notEquals)
	}

	respawn = (spawn: Entity) => {
		this.timeDied = -1
		this.damageTaken = undefined
		this.healthPoints = this.healthPointsMax
		this.x = spawn.x
		this.y = spawn.y
		this.gravity = PLAYER_GRAVITY
		this.look = {u: false, d: false, l: false, r: true}
		this.setMove({u: false, d: false, l: false, r: false})
	}

	teleport(spawn: MapTile) {
		this.x = spawn.x
		this.y = spawn.y
	}

	private kill = () => {
		this.timeDied = this.getNow()
		this.healthPoints = 0
		this.vx = 0
		this.vy = 0
		this.gravity = 0
		this.setMove({u: false, d: false, l: false, r: false})
		// Clear items
		this.power_ups = []
		this.power_selected = 0
	}

	heal = (damage: number) => {
		this.healthPoints += damage
		if (this.healthPoints >= this.healthPointsMax) this.healthPoints = this.healthPointsMax
	}

	damage = (value: number, cause: DamageCause, context: DamageContext = {
		player: undefined,
		projectile: undefined,
		tile: undefined
	}) => {
		if (this.damageTaken && (this.damageTaken.timestamp + 500) > this.getNow()) {
			return
		}
		this.damageTaken = {
			cause: cause,
			value: value,
			player: context.player,
			projectile: context.projectile,
			tile: context.tile,
			timestamp: this.getNow()
		}
		this.healthPoints -= Math.max(value, 0)
		if (this.healthPoints <= 0) this.kill()
	}

	damageFall = (vy: number) => {
		const part = -7 + vy
		const damage = Math.ceil(part / this.healthPointsMax * 100)
		if (damage <= 0) {
			return
		}
		this.damage(damage, DamageCause.FALL)
	}

	damaged = () => this.damageTaken

	hits = (player: Player) => {
		if (this.isSwung() && player.isAlive() && player.collidesWith(this.hit_box())) {
			this.hitTime = 0
			const power = this.getSelectedPowerUp()
			if (!power) {
				player.damage(this.hitPoints, DamageCause.PLAYER, {player: this})
				return
			}
			switch (power.type) {
			case PowerType.SWORD:
				this.usePowerUp(power)
				player.damage(this.hitPoints * 1.5, DamageCause.PLAYER, {player: this})
				break
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

	isSwung = () => this.getNow() - 150 < this.hitTime

	doSwing = () => this.hitTime = this.getNow()

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
		hpm: this.healthPointsMax,
		w: this.width,
		h: this.height,
		x: this.x,
		y: this.y,
		vx: this.vx,
		vy: this.vy,
		dmg: damageToModel(this.damageTaken),
		tod: this.timeDied,
		tdc: this.timeDisconnected,
		l: this.look,
		m: this._move,
		pu: this.power_ups.map(p => p.toModel()),
		ps: this.power_selected
	})

	toUpdateModel = (): PlayerUpdateModel => ({
		uid: this.id,
		hp: this.healthPoints,
		hpm: this.healthPointsMax,
		x: this.x,
		y: this.y,
		vx: this.vx,
		vy: this.vy,
		dmg: damageToModel(this.damageTaken),
		l: this.look,
		m: this._move,
		pu: this.power_ups.map(p => p.toModel()),
		ps: this.power_selected
	})

	isConnected = () => this.timeDisconnected < 0

	isTimedOut = () => this.timeDisconnected >= 0 && this.isNowOrBefore(this.timeDisconnected + PLAYER_TIMEOUT)

	isDangling = () => this.timeDisconnected >= 0 && this.isAfterNow(this.timeDisconnected + PLAYER_TIMEOUT)

	reconnect = (socket_id: string) => {
		console.log("Reconnected", socket_id)
		this.socket_id = socket_id
		this.timeDisconnected = -1
		this.setMove({u: false, d: false, l: false, r: false})
	}

	disconnect = () => {
		this.socket_id = ""
		this.timeDisconnected = this.getNow()
		this.setMove({u: false, d: false, l: false, r: false})
	}
}