import PlayerModel from "../model/PlayerModel"
import TileModel from "../model/TileModel"
import BoomerangModel from "../model/BoomerangModel"
import ImageController from "./image"

export default class MapController {

  imageController: ImageController
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  ratio: number
  ID: string

  DEBUG = false
  LOADING = true

  MAP = [] as TileModel[]
  PLAYERS = [] as PlayerModel[]
  BOOMERANGS = [] as BoomerangModel[]

  constructor(canvas: HTMLCanvasElement, ratio: number, ID: string, ic: ImageController) {
    this.canvas = canvas
    this.ctx = canvas.getContext("2d") as CanvasRenderingContext2D
    this.ctx.imageSmoothingEnabled = false
    this.ratio = ratio
    this.ID = ID
    this.imageController = ic
    console.log(ID)

    window.requestAnimationFrame(this.tick)
  }

  toggleDebug = () => this.DEBUG = !this.DEBUG

  setLoading = (loading: boolean) => this.LOADING = loading

  setPlayers = (players: PlayerModel[]) => this.PLAYERS = players

  setBoomerangs = (boomerangs: BoomerangModel[]) => this.BOOMERANGS = boomerangs

  setMap = (map: TileModel[]) => {
    this.MAP = map
    this.ctx.imageSmoothingEnabled = false
  }

  setID = (id: string) => this.ID = id

  font = (size: number) => `${size * this.ratio}px FiveFontsatFreddy`

  you = () => this.PLAYERS.find(p => p.i === this.ID) || undefined

  drawMap = () => {
    let cx: number
    let cy: number

    const playerToFocus = this.you()
    if (playerToFocus) {
      cx = Math.round((playerToFocus.x * this.ratio + playerToFocus.w * this.ratio * .5) - this.canvas.width / 2)
      cy = Math.round((playerToFocus.y * this.ratio + playerToFocus.h * this.ratio * .5) - this.canvas.height / 2)
    } else {
      cx = Math.round(this.canvas.width / 2)
      cy = Math.round(this.canvas.height / 2)
    }
    for (const tile of this.MAP.filter(tile => tile.wa)) {
      this.ctx.fillStyle = tile.c
      let bx = 0, by = 0
      switch (tile.i) {
        case "wood":
          bx = 48
          break
        case "grass":
          bx = 32
          break
        case "dirt":
          bx = 16
          break
      }
      this.ctx.drawImage(
        this.imageController.addImage("tiles"),
        bx,
        by,
        16,
        16,
        tile.x * this.ratio - cx,
        tile.y * this.ratio - cy,
        tile.w * this.ratio,
        tile.h * this.ratio
      )
    }
    for (const player of this.PLAYERS.filter(p => p.d === undefined)) {
      const player_w = player.w * this.ratio
      const player_h = player.h * this.ratio
      const player_x = player.x * this.ratio
      const player_y = player.y * this.ratio
      this.ctx.textAlign = "center"
      this.ctx.fillStyle = "#FFF"
      this.ctx.font = this.font(12)
      this.ctx.fillText(player.n, player_x - cx + player_w * .5, player_y - cy + 2)

      this.ctx.drawImage(
        this.imageController.addImage("character"),
        1,
        0,
        13,
        16,
        player_x - cx,
        player_y - cy,
        player_w,
        player_h
      )
    }
    for (const boomerang of this.BOOMERANGS) {
      this.ctx.fillStyle = boomerang.color
      this.ctx.fillRect(
        boomerang.x * this.ratio - cx,
        boomerang.y * this.ratio - cy,
        boomerang.w * this.ratio,
        boomerang.h * this.ratio
      )
    }
  }

  drawMessage = () => {
    const you = this.you()
    if (!you) {
      return
    }
    if (you.d === undefined) {
      return
    }
    const now = Date.now()
    this.ctx.fillStyle = "rgba(0,0,0,0.8)"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.textAlign = "center"
    this.ctx.fillStyle = "#FFF"
    this.ctx.font = this.font(50)
    this.ctx.fillText("You Died!", this.canvas.width / 2, this.canvas.height / 2)

    this.ctx.font = this.font(30)
    this.ctx.fillText("Respawn in: " + Math.round(((you.d + 5000) - now) / 1000), this.canvas.width / 2, (this.canvas.height / 2) + (30 * this.ratio))

  }
  drawLoading = () => {
    this.ctx.fillStyle = "#1d1d1d"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.textAlign = "center"
    this.ctx.fillStyle = "#f3f3f3"
    this.ctx.font = this.font(20)
    this.ctx.fillText("LOADING", this.canvas.width / 2, this.canvas.height / 2)
  }
  drawDebug = (delta: number) => {
    this.ctx.font = this.font(10)
    this.ctx.fillStyle = "white"
    this.ctx.textAlign = "left"
    let x = 2 * this.ratio
    let y = 20 * this.ratio
    this.ctx.fillText("delta: " + delta, x, y)
    const you = this.you()
    if (you == null || you.d !== undefined) {
      return
    }
    y += 10 * this.ratio
    this.ctx.fillText("name: " + you.n, x, y)
    y += 10 * this.ratio
    this.ctx.fillText("x: " + you.x, x, y)
    y += 10 * this.ratio
    this.ctx.fillText("y: " + you.y, x, y)
    y += 10 * this.ratio
    this.ctx.fillText("vx: " + you.vx, x, y)
    y += 10 * this.ratio
    this.ctx.fillText("vy: " + you.vy, x, y)
    y += 10 * this.ratio
    this.ctx.fillText("falling: " + (you.vy !== 0) ? "true" : "false", x, y)
    y += 10 * this.ratio
    this.ctx.fillText("alive: " + you.d !== undefined ? "true" : "false", x, y)
    y += 10 * this.ratio
    this.ctx.fillText("l.u: " + you.l.u, x, y)
    y += 10 * this.ratio
    this.ctx.fillText("l.d: " + you.l.d, x, y)
    y += 10 * this.ratio
    this.ctx.fillText("l.l: " + you.l.l, x, y)
    y += 10 * this.ratio
    this.ctx.fillText("l.r: " + you.l.r, x, y)

    const boomerang = this.BOOMERANGS.find(b => b.player === you.i)
    if (!boomerang) {
      return
    }
    y += 10 * this.ratio
    this.ctx.fillText("x: " + boomerang.x, x, y)
    y += 10 * this.ratio
    this.ctx.fillText("y: " + boomerang.y, x, y)
    y += 10 * this.ratio
    this.ctx.fillText("vx: " + boomerang.vx, x, y)
    y += 10 * this.ratio
    this.ctx.fillText("vy: " + boomerang.vy, x, y)
  }


  lastRender = Date.now()
  tick = (timestamp: number) => {
    const delta = timestamp - this.lastRender
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.drawMap()
    this.drawMessage()
    if (this.LOADING) this.drawLoading()
    if (this.DEBUG) this.drawDebug(delta)
    this.lastRender = timestamp
    window.requestAnimationFrame(this.tick)
  }
}