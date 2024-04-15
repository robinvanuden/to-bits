import {v4} from "uuid"

export default abstract class Entity {

	private readonly _id: string

	private _x: number
	private _y: number

	private readonly _width: number
	private readonly _height: number

	get id(): string {
		return this._id
	}

	get x(): number {
		return this._x
	}

	get y(): number {
		return this._y
	}

	get width(): number {
		return this._width
	}

	get height(): number {
		return this._height
	}

	set x(x: number) {
		this._x = x
	}

	set y(y: number) {
		this._y = y
	}

	constructor(x: number, y: number, width: number, height: number, id: string | undefined = undefined) {
		this._id = id || v4()
		this._x = x
		this._y = y
		this._width = width
		this._height = height
	}

	public equals = (entity: Entity): boolean => this._id === entity._id

	public collidesWith = (entity: Entity): boolean =>
		this.isWithinX(entity) &&
		this.isWithinY(entity)

	public isWithinX = (entity: Entity): boolean =>
		entity._x < this._x + this._width &&
		entity._x + entity._width > this._x

	public isWithinY = (entity: Entity): boolean =>
		entity._y < this._y + this._height &&
		entity._y + entity._height > this._y


	protected getNow = () => Date.now()

	protected isBeforeNow = (time: number): boolean => time < this.getNow()

	protected isNowOrBefore = (time: number): boolean => time <= this.getNow()

	protected isAfterNow = (time: number): boolean => time > this.getNow()

	protected isNowOrAfter = (time: number): boolean => time >= this.getNow()
}