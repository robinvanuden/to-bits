import {createServer} from "http"
import express from "express"
import cookieParser from "cookie-parser"
import PlayerSocket from "./socket/PlayerSocket"
import imageController from "./controller/ImageController"
import textureController from "./controller/TextureController"
import pack from "../package.json"
import Game from "./game"
import PlayerRepository from "./repository/PlayerRepository"
import {COOKIE_PLAYER_ID} from "./constants"
import path from "path"
import EntityRepository from "./repository/EntityRepository"

const app = express()
const server = createServer(app)

const VERSION: string = pack.version || "?.?.?"
const VERSION_CODE: number = Date.now()

const game: Game | undefined = new Game(VERSION)

const players = new PlayerRepository()
const entities = new EntityRepository()
game.setPlayersRepository(players)
game.setEntityRepository(entities)

app.use(cookieParser())
app.use("/", express.static("dist"))
app.use("/img", express.static("public/img"))

app.get("/", (req, res) => {
	let uuid: string = req.cookies[COOKIE_PLAYER_ID] || ""
	if (uuid.length === 0) {
		// No cookie yet
		uuid = game.generate_uuid()
		// console.log("Generated uuid for new player_id", uuid)
	}
	if (uuid.length !== 36) {
		// Invalid cookie format
		res.sendStatus(401)
		return
	}
	const player = players.getById(uuid)
	if (!player) {
		// Possible old cookie, generate new one
		uuid = game.generate_uuid()
		// console.log("Generated uuid for an old player_id (outdated cookie)")
	}
	if (player && !player.disconnected) {
		// console.log("Invalid session", uuid)
		res.sendStatus(409)
		return
	}

	res.cookie(COOKIE_PLAYER_ID, uuid, {
		httpOnly: true,
		path: "/",
		sameSite: "strict",
		maxAge: 60_000 * 12,
		secure: req.secure || (req.headers.origin || "").startsWith("https")
	})
	res.sendFile(path.resolve(__dirname, "../dist/main.html"))
})

app.use(imageController(players))
app.use(textureController())
console.log("Starting ToBits: v" + VERSION)

new PlayerSocket(game, server, VERSION_CODE)

const PORT: number = Number.parseInt(process.env?.PORT ?? "80")
server.listen(PORT)
server.on("listening", () => console.log(`listening on http://localhost:${PORT}`))