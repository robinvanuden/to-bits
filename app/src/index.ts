import {createServer} from "http"
import express, {Express, Request, Response} from "express"
import cookieParser from "cookie-parser"
import {startSocketServer} from "./socket/PlayerSocket"
import ImageController from "./controller/ImageController"
import CharController from "./controller/CharController"
import TextureController from "./controller/TextureController"
import {generate_uuid, getNow} from "./game"
import {getPlayerRepository} from "./repository/PlayerRepository"
import {COOKIE_PLAYER_ID, VERSION} from "./constants"
import path from "path"

const app: Express = express()
const server = createServer(app)
const VERSION_CODE: number = getNow()

app.use(cookieParser())
app.use("/", express.static("dist"))
app.use("/img", express.static("public/img"))

function setUuidCookie(res: Response, uuid: string) {
	return res.cookie(COOKIE_PLAYER_ID, uuid, {
		httpOnly: true,
		sameSite: "strict",
		maxAge: 60_000 * 12
	})
}

app.get("/", (req: Request, res: Response) => {
	let uuid: string = req.cookies[COOKIE_PLAYER_ID] || ""
	if (uuid.length === 0) {
		// No cookie yet
		uuid = generate_uuid()
		console.log("Generated uuid for new player_id", uuid)
		setUuidCookie(res, uuid).redirect("/")
		return
	}
	if (uuid.length !== 36) {
		// Invalid cookie format
		// res.sendStatus(401)
		res.status(401).sendFile(path.resolve(__dirname, "../dist/nope.html"))
		return
	}
	const player = getPlayerRepository().getById(uuid)
	if (!player) {
		// Possible old cookie, generate new one
		uuid = generate_uuid()
		// console.log("Generated uuid for an old player_id (outdated cookie)")
	}
	if (player && player.isConnected()) {
		// console.log("Invalid session", uuid)
		res.status(409).sendFile(path.resolve(__dirname, "../dist/nope.html"))
		return
	}
	setUuidCookie(res, uuid)
	res.sendFile(path.resolve(__dirname, "../dist/main.html"))
})

app.use(ImageController())
app.use(TextureController())
app.use(CharController())
console.log("Starting ToBits: v" + VERSION)

startSocketServer(server, VERSION_CODE)

const PORT: number = Number.parseInt(process.env?.PORT ?? "80")
server.listen(PORT)
server.on("listening", () => console.log(`listening on http://localhost:${PORT}`))