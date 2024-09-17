import {Router} from "express"
import sharp from "sharp"
import path from "path"
import {getPlayerRepository} from "../repository/PlayerRepository"
import Color from "color"
import {COOKIE_PLAYER_ID} from "../constants"

const loadImage = (name: string) => sharp(path.resolve(__dirname, "../assets/character", name))

const loadCharacterFeatherTint = async (hsl: string) => loadImage("feather.tint.png")
	.modulate({lightness: -45})
	.tint(Color(hsl, "hsl").object())

const loadCharacterFeather = async () => loadImage("feather.png")

const loadCharacterBody = async () => loadImage("body.png")

const loadCharacterLegs = async (type: number) => loadImage("legs" + type + ".png")

const loadCharacterMask = async (type: number) => loadImage("mask" + type + ".png")

const generateCharacter = async (hsl: string, mask_type: number, walk_type: number) => {
	const body = await loadCharacterBody()
	const feather = await loadCharacterFeather()
	const feather_tint = await loadCharacterFeatherTint(hsl)
	const mask = await loadCharacterMask(mask_type)
	const legs = await loadCharacterLegs(walk_type)
	return body.composite([
		{input: await feather.toBuffer(), left: 1, top: 0},
		{input: await feather_tint.toBuffer(), left: 2, top: 1},
		{input: await mask.toBuffer(), left: 6, top: 6},
		{input: await legs.toBuffer(), left: 0, top: 0}
	])
}

const generateDamagedCharacter = async (walk_type: number) => {
	const body = await loadCharacterBody()
	const feather = await loadCharacterFeather()
	const legs = await loadCharacterLegs(walk_type)
	return body.composite([
		{
			input: await feather.grayscale(true).gamma(3).modulate({
				brightness: 100,
				lightness: 100
			}).toBuffer(), left: 1, top: 0
		},
		{
			input: await legs.grayscale(true).gamma(3).modulate({
				brightness: 100,
				lightness: 100
			}).toBuffer(), left: 0, top: 15
		}
	]).grayscale(true).gamma(3).modulate({brightness: 100, lightness: 100})
}

export default function () {

	const image_router = Router()

	image_router.get("/i/p/:direction/:walk/damaged.png", async (req, res) => {
		const left = (req.params.direction || "l") === "l"
		const walk = (req.params.walk || "0") === "0" ? 0 : 1
		const char = await generateDamagedCharacter(walk)
		const char_final = sharp(await char.toBuffer()).flop(left)
		res.contentType("image/png")
		res.end(await char_final.toBuffer(), "utf-8")
	})

	image_router.get("/i/p/:direction/:walk/:hash.png", async (req, res) => {
		const uuid = req.params.hash || undefined
		if (!uuid) {
			res.sendStatus(401)
			return
		}
		const left = (req.params.direction || "l") === "l"
		const walk = (req.params.walk || "0") === "0" ? 0 : 1
		const player = getPlayerRepository().getById(uuid)
		if (!player) {
			res.sendStatus(404)
			return
		}
		const char = await generateCharacter(player.color, player.mask, walk)
		const char_final = sharp(await char.toBuffer()).flop(left)
		res.contentType("image/png")
		res.end(await char_final.toBuffer(), "utf-8")
	})

	image_router.get("/i/p/:direction/:hash.png", async (req, res) => {
		const uuid = req.params.hash || undefined
		if (!uuid) {
			res.sendStatus(401)
			return
		}
		const left = (req.params.direction || "l") === "l"
		const player = getPlayerRepository().getById(uuid)
		if (!player) {
			res.sendStatus(404)
			return
		}
		const char1 = await generateCharacter(player.color, player.mask, 0)
		const char2 = await generateCharacter(player.color, player.mask, 1)
		const char3 = await generateCharacter(player.color, player.mask, 2)
		const char4 = await generateDamagedCharacter(0)
		const char5 = await generateDamagedCharacter(1)
		const char6 = await generateDamagedCharacter(2)
		const canvas = sharp({
			create: {
				width: 48,
				height: 32,
				channels: 4,
				background: {r: 0, g: 0, b: 0, alpha: 0}
			},
		}).png().composite([
			{
				input: await sharp(await char1.toBuffer()).flop(left).toBuffer(), top: 0, left: 0
			},
			{
				input: await sharp(await char2.toBuffer()).flop(left).toBuffer(), top: 0, left: 16
			},
			{
				input: await sharp(await char3.toBuffer()).flop(left).toBuffer(), top: 0, left: 32
			},
			{
				input: await sharp(await char4.toBuffer()).flop(left).toBuffer(), top: 16, left: 0
			},
			{
				input: await sharp(await char5.toBuffer()).flop(left).toBuffer(), top: 16, left: 16
			},
			{
				input: await sharp(await char6.toBuffer()).flop(left).toBuffer(), top: 16, left: 32
			}
		])
		res.contentType("image/png")
		res.end(await canvas.toBuffer(), "utf-8")
	})

	image_router.get("/favicon.ico", async (req, res) => {
		const uuid = req.cookies[COOKIE_PLAYER_ID] || ""
		const player = getPlayerRepository().getById(uuid)
		const mask = player?.mask || 1
		const color = player?.color || "hsl(0, 55%, 55%)"
		const char = await generateCharacter(color, mask, 0)
		res.contentType("image/x-icon")
		res.end(await char.toBuffer(), "utf-8")
	})

	return image_router
}