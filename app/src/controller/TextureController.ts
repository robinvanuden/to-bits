import express, {Router} from "express"
import sharp from "sharp"
import path from "path"

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

	router.use("/texture/set/", express.static(path.resolve(__dirname, "../assets/map/")))

	router.get("/texture/test.webp", async (req, res) => {
		const source_path = path.resolve(__dirname, "../assets/map/stone.jpg")
		const image = generateTexture(source_path, 48, 48, 16, 16)
			.webp(webpOptions())

		res.contentType("image/webp")
		res.end(await image.toBuffer({resolveWithObject: false}), "utf-8")
	})


	return router
}