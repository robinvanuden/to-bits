import {createServer} from "http"
import express from "express"
import PlayerSocket from "./socket/PlayerSocket"
import image_router from "./controller/ImageController"
import pack from "../package.json"
import Game from "./game"
import PlayerRepository from "./repository/PlayerRepository"

const app = express()
const server = createServer(app)

const VERSION: string = pack.version || "?.?.?"
const VERSION_CODE: number = Date.now()

const game: Game | undefined = new Game(VERSION)

const players = new PlayerRepository()
game.setPlayersRepository(players)

app.use("/img", express.static("public/img"))
app.use("/", express.static("dist"))

app.use(image_router(players))
console.log("Starting ToBits: v" + VERSION)

new PlayerSocket(game, server, VERSION_CODE)

const PORT: number = Number.parseInt(process.env?.PORT ?? "80")
server.listen(PORT)
server.on("listening", () => console.log(`listening on http://localhost:${PORT}`))