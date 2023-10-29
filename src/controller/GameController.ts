import PlayerController from "./PlayerController"
import {Player} from "../types/Player"
import World from "../types/world"
import BoomerangController from "./BoomerangController"
import lobby from "../map/lobby.json"
import PowerUpController from "./PowerUpController"

export default class GameController {

  DELTA = 0
  TICKS = 50
  lobby = new World(lobby.tiles)

  private __players = new PlayerController()
  private __boomerangs = new BoomerangController()
  private __power_ups = new PowerUpController()

  private started = false
  private __interval: NodeJS.Timeout | undefined = undefined

  boomerangs = () => this.__boomerangs

  players = () => this.__players

  power_ups = () => this.__power_ups

  map = (): World => this.lobby

  isStarted = () => this.started

  // TODO: MOVE TO if statement
  private isKilled = (p: Player): boolean => p.died === undefined && p.y > this.map().void()

  private checkPlayerPosition = (delta: number) => {
    const solids = this.map().blocksSolid()
    for (const boomerang of this.boomerangs().list()) {
      boomerang.x += boomerang.vx
      boomerang.y += boomerang.vy
      if (solids.find(boomerang.isBroke)) {
        this.boomerangs().delete(boomerang)
      }
    }
    const airs = this.map().blocksAir()
    for (const walkable of airs) {
      const random = Math.round(Math.random() * 8000)
      if (walkable && !walkable.hasPowerUp() && random === 1) {
        this.power_ups().spawnPower(walkable)
      }
    }
    const walkables = this.map().blocksWalkable()
    for (const player of this.players().alive()) {
      player.vy += player.gravity * delta

      if (player.move.l) {
        player.x -= player.sw
        if (solids.find(t => t.isColliding(player))) player.x += player.sw
      }
      if (player.move.r) {
        player.x += player.sw
        if (solids.find(t => t.isColliding(player))) player.x -= player.sw
      }
      if (player.move.u && player.canJump() && !solids.find(t => t.isColliding(player))) {
        player.vy -= player.sj
        player.falling = true
      }
      player.x += player.vx
      player.y += player.vy

      const solid = solids.find(t => t.isColliding(player) && !t.isAboutWalking(player))
      const walkable = walkables.find(t => t.isAboutWalking(player))
      if (solid && player.vy > 0) {
        player.y = solid.y - player.height
        player.vy = 0
        player.falling = false
      } else if (walkable && player.vy > 0) {
        player.y = walkable.y - player.height
        player.vy = 0
        player.falling = false
      }
      for (const boomerang of this.boomerangs().list()) {
        if (boomerang.isCaught(player)) {
          this.boomerangs().delete(boomerang)
        }
        if (boomerang.isHit(player)) {
          this.players().kill(player)
          this.boomerangs().deleteFrom(player)
          this.boomerangs().delete(boomerang)
        }
      }
      for (const power of this.power_ups().list()) {
        if (power.isTouching(player)) {
          player.power_ups.push(power.type)
          this.power_ups().remove(power)
        }
      }
      if (this.isKilled(player)) {
        this.players().kill(player)
        this.boomerangs().deleteFrom(player)
      }
    }
  }

  private checkDisconnectedPlayers = () => {
    for (const player of this.players().disconnected()) {
      console.log("Remove player: " + player.id)
      this.players().remove(player)
    }
  }

  private checkRespawnPlayers = () => {
    for (const player of this.players().respawns()) {
      console.log("Respawn player: " + player.id)
      this.players().respawn(player, this.map().randomSpawn())
    }
  }

  private tick = (delta: number) => {
    this.DELTA = delta
    this.checkPlayerPosition(delta)
    this.checkRespawnPlayers()
    this.checkDisconnectedPlayers()
  }

  start = (run: () => void) => {
    if (this.__interval) {
      console.log("Started game loop already started")
      return
    }
    console.log("Started game loop")
    this.started = true
    let updated = Date.now()
    this.__interval = setInterval(() => {
      let now = Date.now()
      this.tick(now - updated)
      run()
      updated = now
      if (!this.players().filled()) this.stop()
    }, 1000 / this.TICKS)
  }

  stop = () => {
    if (!this.__interval) {
      return
    }
    console.log("Stopped game loop")
    clearInterval(this.__interval)
    this.started = false
    this.__interval = undefined
  }

}