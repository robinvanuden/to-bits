import {createServer} from "http"
import express from "express"
import cookieParser from "cookie-parser"
import PlayerSocket from "./socket/PlayerSocket"
import image_router from "./controller/ImageController"
import pack from "../package.json"
import Game from "./game"
import PlayerRepository from "./repository/PlayerRepository"
import {COOKIE_PLAYER_ID} from "./constants"
import path from "path"
import SessionRepository from "./repository/SessionRepository"

const app = express()
const server = createServer(app)

app.use(cookieParser())

const VERSION: string = pack.version || "?.?.?"
const VERSION_CODE: number = Date.now()

const game: Game | undefined = new Game(VERSION)

const sessions = new SessionRepository()
const players = new PlayerRepository()
game.setPlayersRepository(players)
game.setSessionsRepository(sessions)

app.use("/img", express.static("public/img"))
app.use("/", express.static("dist"))

app.get("/", (req, res) => {
  let uuid = req.cookies[COOKIE_PLAYER_ID] || ""
  let isNew = false
  if (uuid.length <= 0) {
    uuid = game.generate_uuid()
    isNew = true
  } else if (uuid.length > 0 && !sessions.contains(uuid)) {
    // Old cookie
    uuid = game.generate_uuid()
    isNew = true
  }
  if (isNew && sessions.add(uuid)) {
    res.cookie(COOKIE_PLAYER_ID, uuid, {httpOnly: true, maxAge: 900000})
    res.sendFile(path.resolve(__dirname, "../dist/main.html"))
    return
  }
  const player = players.getById(uuid)
  if (!isNew && player && player.disconnected !== undefined) {
    res.sendFile(path.resolve(__dirname, "../dist/main.html"))
    return
  }
  console.log("Invalid session", uuid)
  res.sendStatus(403)
})

app.use(image_router(players))
console.log("Starting ToBits: v" + VERSION)

new PlayerSocket(game, server, VERSION_CODE)

const PORT: number = Number.parseInt(process.env?.PORT ?? "80")
server.listen(PORT)
server.on("listening", () => console.log(`listening on http://localhost:${PORT}`))