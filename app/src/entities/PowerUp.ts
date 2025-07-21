import {v4} from "uuid"
import {PowerUpModel} from "../types/model/PowerUpModel"

export enum PowerType {BOMB, FIREBALL, HEALTH}

export default class PowerUp {

	private readonly _id: string
	private readonly _type: PowerType
	private _uses: number

	private constructor(type: PowerType, uses = 0) {
		this._id = v4()
		this._type = type
		this._uses = uses
	}

	get type() {
		return this._type
	}

	get uses() {
		return this._uses
	}

	public usePower = () => this._uses--

	public equals = (powerUp: PowerUp) => powerUp._id === this._id

	public notEquals = (powerUp: PowerUp) => powerUp._id !== this._id

	public static toString = (type: PowerType) => PowerType[type].toString()

	private static randomType = (): PowerType => {
		const index = Object.keys(PowerType).map(Number).filter(Number.isInteger)
		return Math.round(Math.random() * (index.length - 1)) as PowerType
	}

	public static random = () => {
		const type = PowerUp.randomType()
		let uses = 1
		switch (type) {
		case PowerType.BOMB:
			if (Math.random() * 1_000_000 === 1_000_000)
				uses = 9
			break
		}
		return new PowerUp(type, uses)
	}

	public toModel = (): PowerUpModel => ({
		id: this._id,
		u: this.uses,
		t: this.type.valueOf()
	})
}

