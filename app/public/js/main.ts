import {io} from "socket.io-client"
import Map from "./map"
import Images from "./images"
import Data from "./data"
import Hud from "./hud"
import Canvas from "./canvas"
import {TileLayerModel} from "./model/TileModel"

(() => {

	const updateFavicon = () => (document.getElementById("main-icon") as HTMLLinkElement)
		.href = "/favicon.ico?t=" + Date.now()

	const host = new URL(location.toString())
	const secure = location.protocol === "https:"
	host.protocol = secure ? "https:" : "http:"
	host.pathname = "/"

	const origin = new URL(host)
	origin.protocol = secure ? "wss:" : "ws:"

	const socket = io({
		host: origin.host,
		hostname: origin.hostname,
		port: origin.port,
		transports: ["websocket"],
		upgrade: true,
		ackTimeout: 2000,
		autoConnect: true,
		secure: secure,
		reconnection: true,
		forceNew: true
	})

	socket.on("connect_error", err => console.log("Error conn:", err))

	let BUILD = 0

	const canvas = new Canvas(document.getElementById("playground") as HTMLCanvasElement)

	const data = new Data()

	const images = new Images(host)

	const map = new Map(canvas, data, images)

	const hud = new Hud(canvas, data, images)

	socket.on("version", version => {
		if (data.version() === "") {
			document.title = `To Bits! v${version}`
			data.setVersion(version)
			hud.setLoading(true)
		}
	})

	socket.on("build", build => {
		if (BUILD === 0) {
			BUILD = build
		} else if (BUILD !== build) {
			window.location.reload()
		}
	})

	socket.on("connect", () => {
		data.setID(socket.id)
		updateFavicon()
	})

	socket.on("disconnect", () => hud.setLoading(true))

	socket.on("nope", () => hud.setNope(true))

	socket.on("map_layer", (map_data: TileLayerModel) => {
		data.setMapLayer(map_data)
	})

	socket.on("message", (message: string) => {
		data.addMessage(message)
	})

	socket.on("textures", async (textures: string[]) => {
		for (const texture of textures) {
			await images.addImage(texture)
		}
		hud.setLoading(false)
	})

	socket.on("players", async players => {
		data.setPlayers(players)
		// Load textures of players
		for (const player of players) {
			await images.loadAllPlayer(player.uid)
		}
	})

	socket.on("projectiles", projectiles => {
		data.setProjectiles(projectiles)
		// TODO: Add texture load
	})

	const keyEvent = (ev: KeyboardEvent, pressed: boolean) => {
		const you = map.you()
		if (!you) {
			return
		}
		const key = ev.key.toLowerCase()
		if (key === "1") {
			socket.emit("item.1", pressed)
		} else if (key === "2") {
			socket.emit("item.2", pressed)
		} else if (key === "3") {
			socket.emit("item.3", pressed)
		}
		if (key === "d") {
			socket.emit("move.right", pressed)
		} else if (key === "a") {
			socket.emit("move.left", pressed)
		}
		if (key === "w") {
			socket.emit("move.up", pressed)
		} else if (key === "s") {
			socket.emit("move.down", pressed)
		}
		if (key === "e") {
			socket.emit("move.interact", pressed)
		}
		if (!pressed && key === " ") {
			socket.emit("move.action", pressed)
		}
	}

	const onMouseRelease = () => {
		const you = map.you()
		if (!you) {
			return
		}
		socket.emit("radius")
	}


	document.addEventListener("contextmenu", e => e.preventDefault())
	window.addEventListener("keydown", events => keyEvent(events, true))
	window.addEventListener("keyup", events => keyEvent(events, false))
	window.addEventListener("mouseup", onMouseRelease)

	updateFavicon()

	const loop = () => {
		canvas.clear()
		if (!hud.loading()) map.tick()
		hud.tick()
		requestAnimationFrame(loop)
	}
	requestAnimationFrame(loop)
})()