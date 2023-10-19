import Players from "./controller/players"
import {Player} from "./types/player"
import {LOBBY_RAW} from "./map/lobby"
import World from "./controller/world"
import Boomerangs from "./controller/boomerangs"

export default class Game {

  DELTA = 0
  TICKS = 50
  lobby = new World(LOBBY_RAW)
  __players = new Players()
  __boomerangs = new Boomerangs()

  boomerangs = () => this.__boomerangs

  players = () => this.__players

  map = (): World => this.lobby

  getDelta = () => this.DELTA

  private isKilled = (p: Player): boolean => {
    return p.died === undefined && p.y > this.map().getVoid()
  }

  private checkPlayerPosition = (delta: number) => {
    const solids = this.map().getSolidBlocks()
    const walkables = this.map().getWalkableBlocks()
    for (const player of this.players().alive()) {
      player.vy += player.gravity * delta
      if (player.move.l) {
        player.x -= player.sw
        if (solids.find(tile => player.isColliding(tile))) player.x += player.sw
      }
      if (player.move.r) {
        player.x += player.sw
        if (solids.find(tile => player.isColliding(tile))) player.x -= player.sw
      }
      if (player.move.u && !player.jumping) {
        player.vy -= player.sj
        player.jumping = true
      }
      player.x += player.vx
      player.y += player.vy

      if (solids.find(tile => player.isColliding(tile))) {
        player.y -= player.vy
        player.vy = 0
      }
      if (walkables.find(tile => player.isWalkingOn(tile))) {
        player.jumping = false
      }
      for (const boomerang of this.boomerangs().listAll()) {
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
    for (const boomerang of this.boomerangs().listAll()) {
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

  private tick = (delta: number, run: () => void) => {
    this.DELTA = delta
    this.checkPlayerPosition(delta)
    this.checkRespawnPlayers()
    this.checkDisconnectedPlayers()
    run()
  }

  start = (run: () => void) => {
    if (this.players().filled()) {
      return
    }
    console.log("Started game loop")
    let updated = Date.now()
    const interval = setInterval(() => {
      let now = Date.now()
      this.tick(now - updated, run)
      updated = now
      if (!this.players().filled()) {
        console.log("Stopped game loop")
        clearInterval(interval)
      }
    }, 1000 / this.TICKS)
  }

}