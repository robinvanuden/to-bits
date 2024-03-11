import {Router} from "express"
import {useWorld1} from "../world/WorldLoader"
import sharp from "sharp"
import path from "path"

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

  router.get('/texture/test.webp', async (req, res) => {
    const source_path = path.resolve(__dirname, "../assets/map/stone.jpg")
    const image = generateTexture(source_path, 48, 48, 16, 16)
      .webp(webpOptions())

    res.contentType("image/webp")
    res.end(await image.toBuffer({resolveWithObject: false}), "utf-8")
  })

  router.get("/texture/:hash.webp", async (req, res) => {
    const hash = req?.params?.hash || ""
    if (hash.length <= 0) {
      return res.sendStatus(400)
    }
    const decrypted_raw = Buffer.from(hash, "base64url").toString("utf-8")
    if (decrypted_raw.length <= 0) {
      return res.sendStatus(400)
    }
    const decrypted = JSON.parse(decrypted_raw)
    if (!decrypted) {
      return res.sendStatus(400)
    }
    const layer = decrypted?.layer || ""
    const tile_id = decrypted?.tile_id || ""

    if (layer.length <= 0 || tile_id.length <= 0) {
      return res.sendStatus(400)
    }
    console.log(layer, tile_id)

    let tile = world1.floor().tiles().find(t => t.id === tile_id)
    if (!tile) {
      tile = world1.powers().tiles().find(t => t.id === tile_id)
    }
    if (!tile) {
      return res.sendStatus(404)
    }

    const source_path = path.resolve(__dirname, "wow", tile.source)
    const image = generateTexture(source_path, tile.offset_x, tile.offset_y, tile.tilewidth, tile.tileheight)
    console.log(source_path)

    res.contentType("image/webp")
    return res.end(await image.toBuffer(), "utf-8")
  })

  return router
}