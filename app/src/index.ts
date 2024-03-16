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

const app = express()
const server = createServer(app)

const VERSION: string = pack.version || "?.?.?"
const VERSION_CODE: number = Date.now()

const game: Game | undefined = new Game(VERSION)

const players = new PlayerRepository()
game.setPlayersRepository(players)

app.use(cookieParser())
app.use("/", express.static("dist"))

app.get("/", (req, res) => {
  let uuid: string = req.cookies[COOKIE_PLAYER_ID] || ""
  console.log("incoming uuid", uuid, uuid.length)
  if (uuid.length === 0) {
    // No cookie yet
    uuid = game.generate_uuid()
    // console.log("Generated uuid for new player", uuid)
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
    console.log("Generated uuid for an old player (outdated cookie)", uuid)
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
    maxAge: 30_000,
    secure: req.secure
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