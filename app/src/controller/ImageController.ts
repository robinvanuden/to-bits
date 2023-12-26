import {Router} from "express"
import sharp from "sharp"
import path from "path"
import PlayerRepository from "../repository/PlayerRepository"
import Color from "color"
import {COOKIE_PLAYER_ID} from "../constants"

const loadCharacterTint = async (hsl: string): Promise<sharp.Sharp> => {
  console.log("load character tint", hsl)
  return sharp(path.resolve(__dirname, "../assets/character.tint.png"))
    .modulate({lightness: -26})
    .tint(Color(hsl, "hsl").object())
}

const loadCharacterAsset = async (): Promise<sharp.Sharp> => {
  console.log("load character asset")
  return sharp(path.resolve(__dirname, "../assets/character.png"))
}

const loadCharacterLegs = async (type: number): Promise<sharp.Sharp> => {
  console.log("load character legs overlay")
  return sharp(path.resolve(__dirname, `../assets/character.legs${type}.png`))
}

const loadCharacterMask = async (type: number): Promise<sharp.Sharp> => {
  console.log("load character mask overlay", type)
  return sharp(path.resolve(__dirname, `../assets/character.mask${type}.png`))
}

export default function (players: PlayerRepository) {

  const image_router = Router()

  image_router.get("/image/:hash.png", async (req, res) => {
    const img = await loadCharacterAsset()
    const hash = req.params.hash || ""
    const uuid = hash.substring(0, hash.length - 2)
    const player = players.getById(uuid)
    if (!player) {
      res.sendStatus(404)
      return
    }
    const direction = (hash.substring(hash.length - 2, hash.length - 1) || "r") === "r" ? "r" : "l"
    const walk = (hash.substring(hash.length - 1, hash.length) || "0") === "0" ? 0 : 1
    console.log("image character", uuid, direction)
    const left = direction.toLowerCase() === "l"
    const tint = await loadCharacterTint(player.color)
    const mask = await loadCharacterMask(player.mask)
    const legs = await loadCharacterLegs(walk)
    let char = img.composite([
      {input: await tint.toBuffer()},
      {input: await mask.toBuffer(), left: 5, top: 5},
      {input: await legs.toBuffer()}
    ])
    const char_final = sharp(await char.toBuffer()).flop(left)
    res.contentType("image/png")
    res.end(await char_final.toBuffer(), "utf-8")
  })

  image_router.get("/image/favicon.:timestamp.ico", async (req, res) => {
    const img = await loadCharacterAsset()
    const uuid = req.cookies[COOKIE_PLAYER_ID] || ""
    console.log("favicon", uuid)
    const player = players.getById(uuid)
    if (!player) {
      res.sendStatus(404)
      return
    }
    const tint = await loadCharacterTint(player.color)
    const mask = await loadCharacterMask(player.mask)
    const legs = await loadCharacterLegs(0)
    let char = img.composite([
      {input: await tint.toBuffer()},
      {input: await mask.toBuffer(), left: 5, top: 5},
      {input: await legs.toBuffer()}
    ])
    const char_final = sharp(await char.toBuffer())
    res.contentType("image/x-icon")
    res.end(await char_final.toBuffer(), "utf-8")
  })

  return image_router
}