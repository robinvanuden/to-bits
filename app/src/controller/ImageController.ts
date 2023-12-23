import {Router} from "express"
import sharp from "sharp"
import path from "path"
import PlayerRepository from "../repository/PlayerRepository"
import Color from "color"

const loadCharacterTint = async (hsl: string): Promise<sharp.Sharp> => {
  console.log("load character tint", hsl)
  return sharp(path.resolve(__dirname, "../assets/character.tint.png"))
    .modulate({lightness: -30})
    .tint(Color(hsl, "hsl").object())
}

const loadCharacterAsset = async (): Promise<sharp.Sharp> => {
  console.log("load character asset")
  return sharp(path.resolve(__dirname, "../assets/character.png"))
}

const loadCharacterLegs = async (): Promise<sharp.Sharp> => {
  console.log("load character legs overlay")
  return sharp(path.resolve(__dirname, "../assets/character.legs.png"))
}

const loadCharacterMask = async (type: number): Promise<sharp.Sharp> => {
  console.log("load character mask overlay", type)
  return sharp(path.resolve(__dirname, `../assets/character.mask${type}.png`))
}

export default function (players: PlayerRepository) {

  const image_router = Router()

  image_router.get("/image/character/:uuid.:direction.png", async (req, res) => {
    const img = await loadCharacterAsset()
    const uuid = req.params.uuid || ""
    const player = players.getBySocketUuid(uuid)
    if (!player) {
      res.sendStatus(404)
      return
    }
    const left = (req.params?.direction || "r").toLowerCase() === "l"
    const tint = await loadCharacterTint(player.color)
    const mask = await loadCharacterMask(player.mask)
    const legs = await loadCharacterLegs()
    let char = img.composite([
      {input: await tint.toBuffer()},
      {input: await mask.toBuffer(), left: 5, top: 5},
      {input: await legs.toBuffer()}
    ])
    const char_final = sharp(await char.toBuffer()).flop(left)
    res.contentType("image/png")
    res.end(await char_final.toBuffer(), "utf-8")
  })
  return image_router
}