import {Router} from "express"
import {useWorld1} from "../world/WorldLoader"
import sharp from "sharp"
import path from "path"
import fs from "fs"

const world1 = useWorld1()

const webpOptions = (): sharp.WebpOptions => ({
	quality: 100,
	smartSubsample: true,
	alphaQuality: 100,
	force: true,
	lossless: false,
	effort: 0,
	preset: "icon",
	nearLossless: true,
	mixed: false,
	minSize: false
})

const generateTexture = (source_path: string, x: number, y: number, width: number, height: number): sharp.Sharp => {
	return sharp(source_path, {unlimited: true, ignoreIcc: true,})
		.resize({withoutEnlargement: true, withoutReduction: true, fastShrinkOnLoad: false})
		.extract({width, height, top: y, left: x})
		.webp(webpOptions())
}

export default function () {
	const router = Router()

	router.get("/texture/set/:name.:ext", async (req, res) => {
		const source = req?.params?.name || ""
		if (source.length <= 0) {
			return res.sendStatus(400)
		}
		console.log(source)
		if (source.length <= 0) {
			return res.sendStatus(400)
		}
		const set = world1.findSetByName(source)
		if (!set) {
			return res.sendStatus(404)
		}

		const source_path = path.resolve(__dirname, "wow", set.source())
		if (!fs.existsSync(source_path)) {
			return res.sendStatus(404)
		}
		res.contentType("image/" + path.extname(source_path))
		return res.sendFile(source_path)
	})

	router.get("/texture/test.webp", async (req, res) => {
		const source_path = path.resolve(__dirname, "../assets/map/stone.jpg")
		const image = generateTexture(source_path, 48, 48, 16, 16)
			.webp(webpOptions())

		res.contentType("image/webp")
		res.end(await image.toBuffer({resolveWithObject: false}), "utf-8")
	})


	return router
}