import {Router} from "express"

export default function () {
  const router = Router()

  router.get("/texture/:hash.:extension", (req, res) => {
    const hash = req?.params?.hash || ""
    if (hash.length <= 0) {
      return res.sendStatus(400)
    }
    const decrypted = Buffer.from(hash, "base64url").toString("utf-8")
    console.log(decrypted)
    return res.sendStatus(201)
  })

  return router
}