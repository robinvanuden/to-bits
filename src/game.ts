import Players from "./controller/players"
import {Player} from "./types/player"
import {LOBBY_RAW} from "./map/lobby"
import World from "./controller/world"
import Boomerangs from "./controller/boomerangs"

export default class Game {

  DELTA = 0
  TICKS = 60
  lobby = new World(LOBBY_RAW)
  private __players = new Players()
  private __boomerangs = new Boomerangs()
  private started = false
  private __interval: NodeJS.Timeout | undefined = undefined

  boomerangs = () => this.__boomerangs

  players = () => this.__players

  map = (): World => this.lobby

  isStarted = () => this.started

  private isKilled = (p: Player): boolean => p.died === undefined && p.y > this.map().void()

  private checkPlayerPosition = (delta: number) => {
    const solids = this.map().blocksSolid()
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
      if (player.move.u) console.log("jump?", player.vy)
      if (player.move.u && player.canJump() && !solids.find(t => t.isColliding(player))) {
        player.vy -= player.sj
      }
      player.x += player.vx
      player.y += player.vy

      const solid = solids.find(t => t.isColliding(player) && !t.isAboutWalking(player))
      const walkable = walkables.find(t => t.isAboutWalking(player))
      if (solid && player.vy > 0) {
        player.y = solid.y - player.h
        player.vy = 0
      } else if (walkable && player.vy > 0) {
        player.y = walkable.y - player.h
        player.vy = 0
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
      if (this.isKilled(player)) {
        this.players().kill(player)
        this.boomerangs().deleteFrom(player)
      }
    }
    for (const boomerang of this.boomerangs().list()) {
      boomerang.x += boomerang.vx
      boomerang.y += boomerang.vy
      if (solids.find(tile => boomerang.isBroke(tile))) {
        this.boomerangs().delete(boomerang)
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