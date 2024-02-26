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

const app = express()
const server = createServer(app)

app.use(cookieParser())

const VERSION: string = pack.version || "?.?.?"
const VERSION_CODE: number = Date.now()

const game: Game | undefined = new Game(VERSION)

const players = new PlayerRepository()
game.setPlayersRepository(players)

app.use("/img", express.static("public/img"))
app.use("/", express.static("dist"))

app.get("/", (req, res) => {
  let uuid: string = req.cookies[COOKIE_PLAYER_ID] || ""
  console.log("incoming uuid", uuid, uuid.length)
  if (uuid.length <= 0) {
    // No cookie yet
    uuid = game.generate_uuid()
    console.log("Generated uuid for new player", uuid)
    res.cookie(COOKIE_PLAYER_ID, uuid, {httpOnly: true, sameSite: "strict", maxAge: 900000})
    res.sendFile(path.resolve(__dirname, "../dist/main.html"))
    return
  }
  const player = players.getById(uuid)
  if (uuid.length > 30 && !player) {
    // Old cookie
    uuid = game.generate_uuid()
    console.log("Generated uuid for an old player (outdated cookie)", uuid)
    res.cookie(COOKIE_PLAYER_ID, uuid, {httpOnly: true, sameSite: "strict", maxAge: 900000})
    res.sendFile(path.resolve(__dirname, "../dist/main.html"))
    return
  }
  if (player && player.disconnected) {
    res.cookie(COOKIE_PLAYER_ID, uuid, {httpOnly: true, sameSite: "strict", maxAge: 900000})
    res.sendFile(path.resolve(__dirname, "../dist/main.html"))
    return
  }
  // console.log("Invalid session", uuid)
  res.sendStatus(403)
})

app.use(image_router(players))
console.log("Starting ToBits: v" + VERSION)

new PlayerSocket(game, server, VERSION_CODE)

const PORT: number = Number.parseInt(process.env?.PORT ?? "80")
server.listen(PORT)
server.on("listening", () => console.log(`listening on http://localhost:${PORT}`))