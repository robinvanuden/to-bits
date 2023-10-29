import PlayerModel from "../model/PlayerModel"
import TileModel from "../model/TileModel"
import BoomerangModel from "../model/BoomerangModel"
import ImageController from "./image"
import PowerUpModel from "../model/PowerUpModel"

const FONT_TEXT = "FiveFontsatFreddy"

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
  POWER_UPS = [] as PowerUpModel[]

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

  setPowerUps = (powers: PowerUpModel[]) => this.POWER_UPS = powers

  setPlayers = (players: PlayerModel[]) => this.PLAYERS = players

  setBoomerangs = (boomerangs: BoomerangModel[]) => this.BOOMERANGS = boomerangs

  setMap = (map: TileModel[]) => {
    this.MAP = map
    this.ctx.imageSmoothingEnabled = false
  }

  setID = (id: string) => this.ID = id

  font = (size: number, family: string = FONT_TEXT) => `${this.size(size)}px ${family}`

  you = () => this.PLAYERS.find(p => p.i === this.ID) || undefined

  size = (n: number) => n * this.ratio

  drawMap = () => {
    let cx: number
    let cy: number

    const playerToFocus = this.you()
    if (playerToFocus) {
      cx = Math.round((this.size(playerToFocus.x) + this.size(playerToFocus.w) * .5) - this.canvas.width / 2)
      cy = Math.round((this.size(playerToFocus.y) + this.size(playerToFocus.h) * .5) - this.canvas.height / 2)
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
        this.size(tile.x) - cx,
        this.size(tile.y) - cy,
        this.size(tile.w),
        this.size(tile.h)
      )
    }
    for (const power of this.POWER_UPS) {
      switch (power.t) {
        case "BOMB":
          this.ctx.fillStyle = "#1d1d1e"
          break
        case "RANG":
          this.ctx.fillStyle = "#6c492e"
          break
        case "FIRE":
          this.ctx.fillStyle = "#e87619"
          break
      }
      this.ctx.fillRect(
        this.size(power.x) - cx,
        this.size(power.y) - cy,
        this.size(power.w),
        this.size(power.h)
      )
    }
    for (const player of this.PLAYERS.filter(p => p.d === undefined)) {
      const player_w = this.size(player.w)
      const player_h = this.size(player.h)
      const player_x = this.size(player.x)
      const player_y = this.size(player.y)

      const name_x = player_x - cx + player_w * .5
      const name_y = player_y - cy - this.size(1)

      this.ctx.font = this.font(12)
      this.ctx.textAlign = "center"
      this.ctx.fillStyle = "#000"
      const padding = 5
      for (let nx = -padding; nx < padding; nx++) {
        for (let ny = -padding; ny < padding + 1; ny++) {
          this.ctx.fillText(player.n, name_x + nx, name_y + ny)
        }
      }

      this.ctx.fillStyle = "#FFF"
      this.ctx.fillText(player.n, name_x, name_y)

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
        this.size(boomerang.x) - cx,
        this.size(boomerang.y) - cy,
        this.size(boomerang.w),
        this.size(boomerang.h)
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

    this.ctx.font = this.font(24)
    this.ctx.fillText("Respawn in: " + Math.round(((you.d + 5000) - now) / 1000), this.canvas.width / 2, (this.canvas.height / 2) + this.size(70))

  }
  drawLoading = () => {
    this.ctx.fillStyle = "#1d1d1d"
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.ctx.textAlign = "center"
    this.ctx.fillStyle = "#f3f3f3"
    this.ctx.font = this.font(50)
    this.ctx.fillText("LOADING", this.canvas.width * .5, this.canvas.height * .5)
  }
  drawDebug = (delta: number) => {
    this.ctx.font = this.font(10)
    this.ctx.fillStyle = "white"
    this.ctx.textAlign = "left"
    let x = this.size(2)
    let y = this.size(20)
    const SPACE = this.size(12)
    this.ctx.fillText("delta: " + delta, x, y)
    const you = this.you()
    if (you == null || you.d !== undefined) {
      return
    }
    console.log(you)
    y += SPACE
    this.ctx.fillText("name: " + you.n, x, y)
    y += SPACE
    this.ctx.fillText("x: " + you.x, x, y)
    y += SPACE
    this.ctx.fillText("y: " + you.y, x, y)
    y += SPACE
    this.ctx.fillText("vx: " + you.vx, x, y)
    y += SPACE
    this.ctx.fillText("vy: " + you.vy, x, y)
    y += SPACE
    this.ctx.fillText("falling: " + (you.vy !== 0) ? "true" : "false", x, y)
    y += SPACE
    this.ctx.fillText("alive: " + you.d !== undefined ? "true" : "false", x, y)
    // Moved directions
    for (const direction in you.m) {
      const value = you.m[direction] || false
      y += SPACE
      this.ctx.fillText("m." + direction + ": " + value, x, y)
    }
    // Look directions
    for (const direction in you.l) {
      const value = you.l[direction] || false
      y += SPACE
      this.ctx.fillText("l." + direction + ": " + value, x, y)
    }
    y += SPACE
    this.ctx.fillText("powers: " + (you.pu !== undefined && you.pu.length > 0 ? "" : "-"), x, y)
    // Look directions
    for (const power of you.pu) {
      y += SPACE
      this.ctx.fillText("- " + power, x, y)
    }

    const boomerang = this.BOOMERANGS.find(b => b.player === you.i)
    if (!boomerang) {
      return
    }
    y += SPACE
    this.ctx.fillText("x: " + boomerang.x, x, y)
    y += SPACE
    this.ctx.fillText("y: " + boomerang.y, x, y)
    y += SPACE
    this.ctx.fillText("vx: " + boomerang.vx, x, y)
    y += SPACE
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