import {createServer} from "http"
import express from "express"
import SocketController from "./controller/SocketController"
import image_router from "./controller/ImageController"
import pack from "../package.json"
import GameController from "./controller/GameController"
import PlayerRepository from "./repository/PlayerRepository"

const app = express()
const server = createServer(app)

const VERSION: string = pack.version || "?.?.?"

const game: GameController | undefined = new GameController(VERSION)

const players = new PlayerRepository()
game.setPlayers(players)

app.use("/img", express.static("public/img"))
app.use("/", express.static("dist"))

app.use(image_router(players))
console.log("Starting ToBits: v" + VERSION)

new SocketController(game, server)

const PORT: number = Number.parseInt(process.env?.PORT ?? "80")
server.listen(PORT)
server.on("listening", () => console.log(`listening on http://localhost:${PORT}`))