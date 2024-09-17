import Player from "../entities/entity/Player"
import MapTile from "../world/MapTile"
import {names, uniqueNamesGenerator} from "unique-names-generator"

const AVAILABLE_COLORS = [
	"hsl(0, 74%, 58%)",
	"hsl(10, 74%, 58%)",
	"hsl(20, 74%, 58%)",
	"hsl(30, 74%, 58%)",
	"hsl(40, 74%, 58%)",
	"hsl(50, 74%, 58%)",
	"hsl(60, 74%, 58%)",
	"hsl(70, 74%, 58%)",
	"hsl(80, 74%, 58%)",
	"hsl(90, 74%, 58%)",
	"hsl(100, 74%, 58%)",
	"hsl(110, 74%, 58%)",
	"hsl(120, 74%, 58%)",
	"hsl(130, 74%, 58%)",
	"hsl(140, 74%, 58%)",
	"hsl(150, 74%, 58%)",
	"hsl(160, 74%, 58%)",
	"hsl(170, 74%, 58%)",
	"hsl(180, 74%, 58%)",
	"hsl(190, 74%, 58%)",
	"hsl(200, 74%, 58%)",
	"hsl(210, 74%, 58%)",
	"hsl(220, 74%, 58%)",
	"hsl(230, 74%, 58%)",
	"hsl(240, 74%, 58%)",
	"hsl(250, 74%, 58%)",
	"hsl(260, 74%, 58%)",
	"hsl(270, 74%, 58%)",
	"hsl(280, 74%, 58%)",
	"hsl(290, 74%, 58%)",
	"hsl(300, 74%, 58%)",
	"hsl(310, 74%, 58%)",
	"hsl(320, 74%, 58%)",
	"hsl(330, 74%, 58%)",
	"hsl(340, 74%, 58%)",
	"hsl(350, 74%, 58%)",
	"hsl(360, 74%, 58%)",
]

const getRandomName = () => uniqueNamesGenerator({
	length: 1,
	dictionaries: [names],
	style: "lowerCase"
})

// const randomColor = () => `hsl(${Math.round(360 * Math.random())}, 74%, 58%)`

const getRandomColor = () => {
	const index = Math.round(Math.random() * (AVAILABLE_COLORS.length - 1))
	return AVAILABLE_COLORS[index] || AVAILABLE_COLORS[0] || ""
}

const getRandomMask = () => Math.round(Math.random() * 7) + 1

export default class PlayerRepository {

	private randomColor = (): string => {
		const color = getRandomColor()
		for (const player of this.players) {
			if (player.color === color) {
				return this.randomColor()
			}
		}
		return color
	}

	private randomMask = (): number => {
		const mask = getRandomMask()
		for (const player of this.players) {
			if (player.mask === mask) {
				return this.randomMask()
			}
		}
		return mask
	}

	private randomName = (): string => {
		const name = getRandomName()
		for (const player of this.players) {
			if (player.name === name) {
				return this.randomName()
			}
		}
		return name
	}

	players: Player[] = []

	list = () => this.players

	filled = () => this.players.length > 0

	alive = () => this.players.filter(p => p.isAlive())

	dead = () => this.players.filter(p => !p.isAlive())

	disconnected = () => this.players.filter(p => p.isTimedOut())

	respawns = () => this.players.filter(p => p.isRespawnAble())

	create = (spawn: MapTile, id: string, socket: string) => {
		const player = new Player(id, socket, this.randomName(), this.randomColor(), this.randomMask(), spawn)
		this.players.push(player)
		return player
	}

	remove = (player: Player) => this.players = this.players.filter(p => p.id !== player.id)

	getById = (id: string) => this.players.find(p => p.id === id) ?? null

	getConnected = (id: string) => this.players.find(player => player.id === id && player.isDangling()) ?? null

	othersAlive = (player: Player) => this.players.filter(p => p.id !== player.id && player.isAlive())
}

let repository: PlayerRepository | undefined

export const getPlayerRepository = () => {
	if (repository) return repository
	repository = new PlayerRepository()
	return repository
}