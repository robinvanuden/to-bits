import {Router} from "express"
import sharp from "sharp"
import path from "path"
import PlayerRepository from "../repository/PlayerRepository"
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
    {input: await mask.toBuffer(), left: 5, top: 5},
    {input: await legs.toBuffer(), left: 0, top: 15}
  ])
}

export default function (players: PlayerRepository) {

  const image_router = Router()

  image_router.get("/image/:hash.png", async (req, res) => {
    const hash = req.params.hash || ""
    const uuid = hash.substring(0, hash.length - 2)
    const player = players.getById(uuid)
    if (!player) {
      res.sendStatus(404)
      return
    }
    const direction = (hash.substring(hash.length - 2, hash.length - 1) || "r") === "r" ? "r" : "l"
    const walk = (hash.substring(hash.length - 1, hash.length) || "0") === "0" ? 0 : 1
    const left = direction.toLowerCase() === "l"
    const char = await generateCharacter(player.color, player.mask, walk)
    const char_final = sharp(await char.toBuffer()).flop(left)
    res.contentType("image/png")
    res.end(await char_final.toBuffer(), "utf-8")
  })

  image_router.get("/favicon.ico", async (req, res) => {
    const uuid = req.cookies[COOKIE_PLAYER_ID] || ""
    const player = players.getById(uuid)
    const mask = player?.mask || 1
    const color = player?.color || "hsl(0, 55%, 55%)"
    const char = await generateCharacter(color, mask, 0)
    const char_final = sharp(await char.toBuffer())
    res.contentType("image/x-icon")
    res.end(await char_final.toBuffer(), "utf-8")
  })

  return image_router
}