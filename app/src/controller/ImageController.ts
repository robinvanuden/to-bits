import {Router} from "express"
import sharp from "sharp"
import path from "path"
import PlayerRepository from "../repository/PlayerRepository"

let imgCharacterLeft: sharp.Sharp | undefined = undefined
let imgCharacterRight: sharp.Sharp | undefined = undefined

function hslToRgb(h: number, s: number, l: number) {
  s /= 100
  l /= 100
  const k = n => (n + h / 30) % 12
  const a = s * Math.min(l, 1 - l)
  const f = n =>
    l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)))
  return {r: 255 * f(0), g: 255 * f(8), b: 255 * f(4)}
}

const loadCharacterTint = async (hue: number, left: boolean): Promise<sharp.Sharp> => {
  return sharp(path.resolve(__dirname, "../assets/character.tint.png"))
    .flop(left)
    .modulate({lightness: -30})
    .tint(hslToRgb(hue, 80, 46))
}

const loadCharacterAsset = async (left: boolean): Promise<sharp.Sharp> => {
  console.log("load character asset", "left:", left)
  return sharp(path.resolve(__dirname, "../assets/character.png")).flop(left)
}

const loadCharacter = async (left: boolean): Promise<sharp.Sharp> => {
  let img = (left ? imgCharacterLeft : imgCharacterRight) || await loadCharacterAsset(left)
  if (!imgCharacterLeft && left) imgCharacterLeft = img
  if (!imgCharacterRight && !left) imgCharacterRight = img
  return img
}

export default function (players: PlayerRepository) {

  const image_router = Router()

  image_router.get("/image/character/:uuid.:direction.png", async (req, res) => {
    const uuid = req.params.uuid || ""
    const player = players.getBySocketUuid(uuid)
    const hue = player?.hue || 0
    const left = (req.params?.direction || "r").toLowerCase() === "l"
    const img = await loadCharacter(left)
    const tint = await loadCharacterTint(hue, left)
    let char = img.composite([{input: await tint.toBuffer()}])
    res.contentType("image/png")
    res.end(await char.toBuffer(), "utf-8")
  })
  return image_router
}