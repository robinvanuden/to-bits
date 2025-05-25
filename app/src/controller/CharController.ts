import {Router} from "express"
import sharp from "sharp"
import path from "path"

const loadFont = (name: string) => sharp(path.resolve(__dirname, "../assets/font", name))

const loadLetter = async (letter: string | undefined) => {
	if (letter == undefined) {
		return undefined
	}
	const letters = loadFont("letters.png")
	const alphabet = "abcdefghijklmnopqrstuvwxyz1234567890-.:!"
	const position = alphabet.indexOf(letter)
	if (position < 0) {
		return undefined
	}
	const top = position * 7
	let left = 0
	let width = 7
	switch (letter) {
	case "!":
	case "i":
	case ":":
	case "-":
		left = 2
		width = 3
		break
	case ".":
		width = 3
		left = 0
		break
	}
	const buffer = letters.extract({top, left, width, height: 7})
	return sharp(await buffer.toBuffer())
}

const loadSpace = async (transparent: boolean) => {
	const width = 4
	const height = 7
	const channels = 4
	const background = transparent ? 0x00000000 : 0xFF000000
	const canvas = sharp(Buffer.alloc(width * height * channels, background), {
		raw: {
			width,
			height,
			channels
		}
	})
	return transparent ? canvas.png() : canvas.jpeg()
}

const loadChar = async (char: string | undefined, transparent: boolean) => {
	if (char == undefined) {
		return loadSpace(transparent)
	}
	if (char === " ") {
		return loadSpace(transparent)
	}
	let image = await loadLetter(char)
	if (!image) {
		image = await loadSpace(transparent)
	}
	return image
}

export default function () {

	const char_router = Router()

	char_router.get("/letter/:letter.png", async (req, res) => {
		const letter = (req.params.letter || "a").toLowerCase().substring(0, 1)
		const letter_image = await loadLetter(letter)
		if (letter_image) {
			res.end(await letter_image.png().toBuffer(), "utf-8")
		}
		// return res.status(400).end(await sharp({raw: {width: 7, height: 7, channels: 4}}).png().toBuffer(), "utf-8")
	})

	char_router.get("/word/:word.:extension", async (req, res) => {
		const extension = req.params.extension || "png"
		const isTransparent = extension === "png"
		const word = (req.params.word || "none").trim()

		const options: sharp.OverlayOptions[] = []

		let width = 2

		for (let i = 0; i < word.length; i++) {
			const char = word[i]
			const char_image = await loadChar(char, isTransparent)
			const char_image_meta = await char_image?.metadata()
			const char_width = char_image_meta?.width || 3
			if (char_image != undefined && char_image_meta != undefined) options.push({
				input: await char_image.toBuffer(),
				top: 0,
				left: width - 2,
				level: i * 10 + 1
			})
			width += char_width - 1
		}

		width -= 1

		const height = 7
		const channels = 4
		const background = isTransparent ? 0x00000000 : 0xFF000000
		const canvas = sharp(Buffer.alloc(width * height * channels, background), {
			raw: {
				width,
				height,
				channels
			}
		})

		const word_image = canvas.resize({
			width,
			height: 7,
			fit: "contain",
			background: {r: 0, g: 0, b: 0, alpha: 1}
		}).composite(options)
		if (isTransparent) {
			res.end(await word_image.png().toBuffer(), "utf-8")
		} else {
			res.end(await word_image.jpeg().toBuffer(), "utf-8")
		}
	})

	return char_router
}