import Players from "./controller/players"
import {Player} from "./types/player"
import {Boomerang} from "./types/boomerang"
import {LOBBY_RAW} from "./map/lobby"
import GameMap from "./controller/controllerMap"

export default class Game {

  DELTA = 0
  TICKS = 50
  lobby = new GameMap(LOBBY_RAW)
  players = new Players()

  getPlayers = () => this.players

  map = (): GameMap => this.lobby

  getDelta = () => this.DELTA

  private isHitBoomerang = (p: Player, b: Boomerang): boolean => {
    const b2: Boomerang | null = p.boomerangs[0] ?? null
    if (b2 && b2.id === b.id) {
      return false
    }
    return p.x < b.x + b.w && p.x + p.w > b.x && p.y < b.y + b.h && p.y + p.h > b.y
  }

  private hasDiedConditions = (p: Player): boolean => {
    for (const player of this.getPlayers().alive()) {
      for (const boomerang of player.boomerangs) {
        if (this.isHitBoomerang(p, boomerang)) {
          return true
        }
      }
    }
    return p.y > this.map().getVoid()
  }

  private isCaughtBoomerang = (p: Player): boolean => {
    const b: Boomerang | null = p.boomerangs[0] ?? null
    if (b == null || b.thrown + 250 > Date.now()) {
      return false
    }
    return p.x < b.x + b.w && p.x + p.w > b.x && p.y < b.y + b.h && p.y + p.h > b.y
  }

  private isKilled = (p: Player): boolean => {
    return p.died === undefined && this.hasDiedConditions(p)
  }

  private checkPlayerPosition = (delta: number) => {
    for (const player of this.getPlayers().alive()) {
      player.vy += player.gravity * delta
      if (player.move.l) {
        player.x -= player.sw
        if (this.map().isCollidingWithMap(player)) player.x += player.sw
      }
      if (player.move.r) {
        player.x += player.sw
        if (this.map().isCollidingWithMap(player)) player.x -= player.sw
      }
      if (player.move.u && !player.arial) {
        player.vy -= player.sj
        player.arial = true
      }
      player.x += player.vx
      player.y += player.vy

      if (this.map().isCollidingWithMap(player)) {
        player.y -= player.vy
        player.vy = 0
      }
      if (this.map().isWalkingOnMap(player)) {
        player.arial = false
      }
      if (this.isKilled(player)) {
        this.getPlayers().kill(player)
      }
    }
  }

  private checkBoomerangPosition = () => {
    for (const player of this.getPlayers().alive()) {
      for (const boomerang of player.boomerangs) {
        boomerang.x += boomerang.vx
        boomerang.y += boomerang.vy

        if (this.isCaughtBoomerang(player)) {
          player.boomerangs = player.boomerangs.filter(b => b.id !== boomerang.id)
        }
        if (this.map().isBrokeOnMap(boomerang)) {
          player.boomerangs = player.boomerangs.filter(b => b.id !== boomerang.id)
        }
      }
    }
  }


  private checkDisconnectedPlayers = () => {
    for (const player of this.getPlayers().disconnected()) {
      console.log("Remove player: " + player.id)
      this.getPlayers().remove(player)
    }
  }


  private checkRespawnPlayers = () => {
    for (const player of this.getPlayers().respawns()) {
      console.log("Respawn player: " + player.id)
      this.getPlayers().respawn(player, this.map().randomSpawn())
    }
  }

  private tick = (delta: number, run: () => {}) => {
    this.DELTA = delta
    this.checkPlayerPosition(delta)
    this.checkBoomerangPosition()
    this.checkRespawnPlayers()
    this.checkDisconnectedPlayers()
    run()
  }

  start = (run: () => {}) => {
    if (this.getPlayers().filled()) {
      return
    }
    console.log("Started game loop")
    let updated = Date.now()
    const interval = setInterval(() => {
      let now = Date.now()
      this.tick(now - updated, run)
      updated = now
      if (!this.getPlayers().filled()) {
        console.log("Stopped game loop")
        clearInterval(interval)
      }
    }, 1000 / this.TICKS)
  }

}