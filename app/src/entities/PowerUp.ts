import {v4} from "uuid"
import {PowerUpModel} from "../types/PowerUpModel"

export enum PowerType {ARROW, BOOMERANG, BOMB, FIREBALL}

export default class PowerUp {

	private readonly _id: string
	private readonly _type: PowerType

	private constructor(type: PowerType) {
		this._id = v4()
		this._type = type
	}

	public type = () => this._type

	public equals = (powerUp: PowerUp) => powerUp._id === this._id

	public notEquals = (powerUp: PowerUp) => powerUp._id !== this._id

	public typeToString = () => PowerUp.toString(this._type)

	public static toString = (type: PowerType) => {
		switch (type) {
		case PowerType.ARROW:
			return "ARROW"
		case PowerType.BOOMERANG:
			return "BOOMERANG"
		case PowerType.BOMB:
			return "BOMB"
		case PowerType.FIREBALL:
			return "FIREBALL"
		}
	}

	private static randomType = (): PowerType => {
		const index = Object.keys(PowerType).map(Number).filter(Number.isInteger)
		return Math.round(Math.random() * (index.length - 1)) as PowerType
	}

	public static random = () => new PowerUp(PowerUp.randomType())

	public static toModel = (power: PowerUp): PowerUpModel => ({
		id: power._id,
		t: power.typeToString(),
	})
}

