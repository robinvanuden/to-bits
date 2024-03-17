import PlayerRepository from "./repository/PlayerRepository"
import {v4, v5} from "uuid"
import WorldLoader, {useWorld1} from "./world/WorldLoader"
import MapTile from "./entities/MapTile"
import ProjectileRepository from "./repository/ProjectileRepository"
import {PowerType} from "./entities/PowerUp"

export default class Game {

  private readonly VERSION: string = "?.?.?"

  private TICKS: number = 60
  private UUID_SEED: string = ""
  private readonly world1: WorldLoader

  private playerRepository!: PlayerRepository
  private projectileRepository!: ProjectileRepository

  private running: boolean = false
  private updated: number = Date.now()

  constructor(VERSION: string) {
    this.VERSION = VERSION
    this.generate_seed()
    this.world1 = useWorld1()
  }

  uuid_seed = () => this.UUID_SEED

  generate_seed = () => {
    this.UUID_SEED = v4()
    console.log("Seed generated: ", this.uuid_seed())
  }

  generate_uuid = () => v5(Date.now() + "", this.uuid_seed())

  version = () => this.VERSION

  players = () => this.playerRepository

  setPlayersRepository = (players: PlayerRepository) => this.playerRepository = players

  projectiles = () => this.projectileRepository

  setProjectileRepository = (projectiles: ProjectileRepository) => this.projectileRepository = projectiles

  world = (): WorldLoader => this.world1

  addPlayer = (uuid: string, socket_id: string): boolean => {
    const continue_player = this.players().getConnected(uuid)
    if (continue_player) {
      // Reconnect
      console.log('User reconnected', socket_id, uuid)
      continue_player.recreate(socket_id)
      return true
    }
    const player = this.players().getById(uuid)
    if (!player) {
      // New player
      const SPAWN_TILE = this.world().randomSpawn()
      if (!SPAWN_TILE) {
        return false
      }
      console.log('User connected', uuid)
      this.players().create(SPAWN_TILE, uuid, socket_id)
      return true
    }
    return false
  }

  private checkPlayerPosition = (delta: number) => {
    const solids = this.world().floor().solids()
    this.spawnPowerUp()
    const tiles_with_power_ups = this.world().powers().tiles()
    const blocksWalkable = this.world().floor().semis()
    for (const player of this.players().alive()) {

      for (const projectile of this.projectiles().list()) {
        projectile.vy += projectile.gravity * delta
        projectile.x += projectile.vx
        projectile.y += projectile.vy

        if (projectile.type === PowerType.BOOMERANG && projectile.isCaught(player)) {
          this.projectiles().remove(projectile)
        }
        if (projectile.isHit(player)) {
          player.kill()
          this.projectiles().removeByPlayer(player)
          if (projectile.type !== PowerType.BOMB) this.projectiles().remove(projectile)
        }
        if (projectile.type !== PowerType.BOMB && solids.find(projectile.isBroke) || projectile.isOut()) {
          this.projectiles().remove(projectile)
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
        player.grounded = false
      }
      player.x += player.vx
      player.y += player.vy


      const solid_walkable = solids.find(t => t.isColliding(player) && t.isAboutWalking(player))
      const solid = solids.find(t => t.isColliding(player))
      const walkable = blocksWalkable.find(t => t.isAboutWalking(player))
      if (solid_walkable && player.vy > 0) {
        player.y = solid_walkable.y - player.height
        player.vy = 0
        player.grounded = true
      } else if (solid && player.vy <= 0) {
        player.y = solid.y + solid.height
        player.vy = 0
        player.grounded = false
      }
      if (walkable && player.vy > 0 && (player.y + player.height) < (walkable.y + walkable.height * .25)) {
        // If y-velocity is higher than 0 (falling) and player collides with top of walkable block
        player.y = walkable.y - player.height
        player.vy = 0
        player.grounded = true
      }
      for (const power_tile of tiles_with_power_ups) {
        if (power_tile.power_up && power_tile.power_up.isTouching(player)) {
          if (player.addPowerUp(power_tile.power_up)) {
            power_tile.power_up = undefined
          }
        }
      }
      if (player.died === undefined && this.world().isPlayerInVoid(player)) {
        player.kill()
        this.projectiles().removeByPlayer(player)
      }
    }
  }

  private spawnPowerUp = () => {
    if (Math.round(Math.random() * 500) !== 1) {
      return
    }
    const airs = this.world().powers().tiles()
    const index = Math.round(Math.random() * (airs.length - 1))
    const tile: MapTile | undefined = airs[index] || undefined
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
      const spawn = this.world().randomSpawn()
      if (spawn) player.respawn(spawn)
    }
  }

  private tick = (delta: number) => {
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
    this.world().clearPowerUps()
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
    switch (powerUp.type) {
      case PowerType.BOOMERANG:
        this.projectiles().throwBoomerang(player, degrees)
        break
      case PowerType.BOMB:
        this.projectiles().placeBomb(player)
        break
      case PowerType.FIREBALL:
        this.projectiles().throwFireball(player, degrees)
        break

    }
  }
}