import {createServer} from "http"
import express from "express"
import SocketController from "./controller/SocketController"
import image_router from "./controller/ImageController"
import pack from "../package.json"

const app = express()
const server = createServer(app)

app.use("/img", express.static("public/img"))
app.use("/", express.static("dist"))

app.use(image_router)

const VERSION: string = pack.version || "?.?.?"
console.log("Starting ToBits: v" + VERSION)

new SocketController(server, VERSION)

const PORT: number = Number.parseInt(process.env.PORT ?? "80")
server.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`))