import {createServer} from "http"
import express from "express"
import {startSocket} from "./socket"

const app = express()
const server = createServer(app)

app.use("/img", express.static("public/img"))
app.use("/", express.static("dist"))

const VERSION: string = process.env.npm_package_version || "?.?.?"
console.log("Starting ToBits: v" + VERSION)

startSocket(server, VERSION)

const PORT: number = Number.parseInt(process.env.PORT ?? "80")
server.listen(PORT, () => console.log(`listening on http://localhost:${PORT}`))