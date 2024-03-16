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

  router.get("/texture/set/:hash.:ext", async (req, res) => {
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
    const [source, seed] = decrypted || ["", ""]
    if (source.length <= 0 || seed.length <= 0) {
      return res.sendStatus(400)
    }
    if (world1.seed() !== seed) {
      return res.sendStatus(404)
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

  router.get('/texture/test.webp', async (req, res) => {
    const source_path = path.resolve(__dirname, "../assets/map/stone.jpg")
    const image = generateTexture(source_path, 48, 48, 16, 16)
      .webp(webpOptions())

    res.contentType("image/webp")
    res.end(await image.toBuffer({resolveWithObject: false}), "utf-8")
  })


  return router
}