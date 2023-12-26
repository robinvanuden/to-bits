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
app.use("/game", express.static("dist"))

app.get("/game", (req, res) => {
  const uuid = req.cookies[COOKIE_PLAYER_ID] || ""
  if (uuid.length === 0) {
    console.log("Redirect empty id", uuid)
    res.redirect("/")
    return
  }
  if (!sessions.contains(uuid)) {
    console.log("Redirect not in list", uuid)
    res.redirect("/")
    return
  }
  res.sendFile(path.resolve(__dirname, "../dist/main.html"))
})

app.get("/", (req, res) => {
  const uuid = req.cookies[COOKIE_PLAYER_ID] || game.generate_uuid()
  if (!sessions.add(uuid)) {
    res.sendStatus(403)
    return
  }
  res.cookie(COOKIE_PLAYER_ID, uuid, {httpOnly: true, maxAge: 900000})
  console.log("Added", uuid)
  res.redirect("/game")
})

app.use(image_router(players))
console.log("Starting ToBits: v" + VERSION)

new PlayerSocket(game, server, VERSION_CODE)

const PORT: number = Number.parseInt(process.env?.PORT ?? "80")
server.listen(PORT)
server.on("listening", () => console.log(`listening on http://localhost:${PORT}`))