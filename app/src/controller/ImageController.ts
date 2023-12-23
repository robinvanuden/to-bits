import {Router} from "express"
import sharp from "sharp"
import path from "path"
import PlayerRepository from "../repository/PlayerRepository"

function hslToRgb(h: number, s: number, l: number) {
  s /= 100
  l /= 100
  const k = n => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return {r: 255 * f(0), g: 255 * f(8), b: 255 * f(4)}
}

const loadCharacterTint = async (hue: number): Promise<sharp.Sharp> => {
  console.log("load character tint", hue)
  return sharp(path.resolve(__dirname, "../assets/character.tint.png"))
    .modulate({lightness: -30})
    .tint(hslToRgb(hue, 80, 46))
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
  console.log("load character mask overlay")
  return sharp(path.resolve(__dirname, `../assets/character.mask${type}.png`))
}

export default function (players: PlayerRepository) {

  const image_router = Router()

  image_router.get("/image/character/:uuid.:direction.png", async (req, res) => {
    const uuid = req.params.uuid || ""
    const player = players.getBySocketUuid(uuid)
    const hue = player?.hue || 0
    const left = (req.params?.direction || "r").toLowerCase() === "l"
    const img = await loadCharacterAsset()
    const tint = await loadCharacterTint(hue)
    const mask = await loadCharacterMask(4)
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