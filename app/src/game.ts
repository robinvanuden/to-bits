import PlayerRepository from "./repository/PlayerRepository"
import World from "./types/world"
import lobby from "./map/lobby.json"
import PowerUp, {PowerType} from "./types/PowerUp"
import Tile from "./types/Tile"
import {v4} from "uuid"

export default class Game {

  private readonly VERSION: string = "?.?.?"

  private DELTA = 0
  private TICKS = 60
  private UUID_SEED: string = ""
  private lobby = new World(lobby.tiles)

  private playerRepository!: PlayerRepository

  private running: boolean = false
  private updated: number = Date.now()

  constructor(VERSION: string) {
    this.VERSION = VERSION
    this.generate_seed()
  }

  uuid_seed = () => this.UUID_SEED

  generate_seed = () => {
    this.UUID_SEED = v4()
    console.log("Seed generated: ", this.uuid_seed())
  }

  version = () => this.VERSION

  players = () => this.playerRepository

  setPlayersRepository = (players: PlayerRepository) => this.playerRepository = players

  map = (): World => this.lobby

  power_ups = () => this.map().map().filter(t => t.power_up != undefined).map(t => t.power_up) as PowerUp[]

  addPlayer = (uuid: string, socket_id: string) => {
    let continue_player = this.players().getConnected(uuid)
    if (continue_player) {
      // Reconnect
      console.log('User reconnected', socket_id, uuid)
      continue_player.recreate(socket_id)
    } else {
      // New player
      const SPAWN_TILE = this.map().randomSpawn()
      console.log('User connected', uuid)
      this.players().create(SPAWN_TILE, uuid, socket_id)
    }
  }

  private checkPlayerPosition = (delta: number) => {
    const solids = this.map().blocksSolid()
    this.spawnPowerUp()
    const tiles_with_power_ups = this.map().blocksWithPowerUps()
    const blocksWalkable = this.map().blocksWalkable()
    for (const player of this.players().alive()) {
      for (const boomerang of player.boomerangs) {
        boomerang.x += boomerang.vx
        boomerang.y += boomerang.vy
        if (solids.find(boomerang.isBroke) || boomerang.isOut()) {
          player.breakBoomerang(boomerang)
        }
      }
      for (const fireball of player.fireballs) {
        fireball.x += fireball.vx
        fireball.y += fireball.vy
        if (solids.find(fireball.isBroke) || fireball.isOut()) {
          player.breakFireball(fireball)
        }
      }
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
      const walkable = blocksWalkable.find(t => t.isAboutWalking(player))
      if (solid && player.vy > 0) {
        player.y = solid.y - player.height
        player.vy = 0
        player.falling = false
      } else if (walkable && player.vy > 0) {
        player.y = walkable.y - player.height
        player.vy = 0
        player.falling = false
      }
      for (const other of this.players().others(player)) {
        for (const boomerang of other.boomerangs) {
          if (boomerang.isCaught(player)) {
            player.breakBoomerang(boomerang)
          }
          if (boomerang.isHit(player)) {
            player.kill()
            other.breakBoomerang(boomerang)
          }
        }
        for (const fireball of other.fireballs) {
          if (fireball.isHit(player)) {
            player.kill()
            other.breakFireball(fireball)
          }
        }
      }
      for (const power_tile of tiles_with_power_ups) {
        if (power_tile.power_up && power_tile.power_up.isTouching(player)) {
          if (player.addPowerUp(power_tile.power_up)) {
            power_tile.power_up = undefined
          }
        }
      }
      if (player.died === undefined && player.y > this.map().void()) {
        player.kill()
      }
    }
  }

  private spawnPowerUp = () => {
    if (Math.round(Math.random() * 800) !== 1) {
      return
    }
    const airs = this.map().blocksAir()
    const index = Math.round(Math.random() * (airs.length - 1))
    const tile: Tile | undefined = airs[index] || undefined
    if (!tile) {
      return
    }
    tile.spawnPower()
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
      player.respawn(this.map().randomSpawn())
    }
  }

  private tick = (delta: number) => {
    this.DELTA = delta
    this.checkPlayerPosition(delta)
    this.checkRespawnPlayers()
    this.checkDisconnectedPlayers()
  }

  private loop = (run: () => void) => {
    let now = Date.now()
    this.tick(now - this.updated)
    run()
    this.updated = now
    if (!this.players().filled()) this.stop()
    if (this.running) setTimeout(() => this.loop(run), 1000 / this.TICKS)
  }

  start = (run: () => void) => {
    if (!this.running) {
      this.running = true
      console.log("Started game loop")
      this.updated = Date.now()
      this.loop(run)
    }
  }

  stop = () => {
    console.log("Stopped game loop")
    this.running = false
    this.map().clearPowerUps()
    this.generate_seed()
  }

  throwItem = (uuid: string, degrees: number) => {
    const player = this.players().getById(uuid)
    if (!player) {
      return
    }
    const powerUp = player.getFirstPowerUp()
    if (!powerUp) {
      return
    }
    player.usePowerUp(powerUp.type)
    if (powerUp.type === PowerType.BOOMERANG) {
      player.throwBoomerang(degrees)
    } else if (powerUp.type === PowerType.FIREBALL) {
      player.throwFireball(degrees)
    }
  }
}