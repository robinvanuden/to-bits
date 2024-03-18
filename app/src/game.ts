import PlayerRepository from "./repository/PlayerRepository"
import {v4, v5} from "uuid"
import WorldLoader, {useWorld1} from "./world/WorldLoader"
import ProjectileRepository from "./repository/ProjectileRepository"
import {PowerType} from "./entities/PowerUp"
import {TICKS} from "./constants"

export default class Game {

  private readonly VERSION: string = "?.?.?"

  private UUID_SEED: string = ""

  private playerRepository!: PlayerRepository
  private projectileRepository!: ProjectileRepository

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

  generate_uuid = () => v5(Date.now() + "", this.uuid_seed())

  version = () => this.VERSION

  players = () => this.playerRepository

  setPlayersRepository = (players: PlayerRepository) => this.playerRepository = players

  projectiles = () => this.projectileRepository

  setProjectileRepository = (projectiles: ProjectileRepository) => this.projectileRepository = projectiles

  world = (): WorldLoader => useWorld1()

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
      const SPAWN_TILE = this.world().pickRandomSpawnPoint()
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
    const semi_solids = this.world().floor().semis()
    const power_up_spawns = this.world().powers().tiles()
    this.world().spawnPowerUp()


    for (const projectile of this.projectiles().list()) {
      // Projectile loop
      projectile.vy += projectile.gravity * delta
      projectile.x += projectile.vx
      projectile.y += projectile.vy

      const solid = solids.find(t => projectile.isColliding(t))
      const semi_solid = semi_solids.find(t => projectile.isWalkingOn(t))
      if (projectile.type === PowerType.BOMB && solid && projectile.isWalkingOn(solid) && projectile.vy > 0) {
        projectile.y = solid.y - projectile.height
        projectile.vy = 0
      }
      if (projectile.type === PowerType.BOMB && semi_solid && projectile.vy > 0) {
        projectile.y = semi_solid.y - projectile.height
        projectile.vy = 0
      } else if (projectile.type !== PowerType.BOMB && solids.find(projectile.isColliding)) {
        this.projectiles().remove(projectile)
      }
      if (projectile.isOut()) {
        this.projectiles().remove(projectile)
      }
    }
    for (const player of this.players().alive()) {
      // Player loop

      for (const projectile of this.projectiles().list()) {
        if (projectile.type === PowerType.BOOMERANG && projectile.isCaught(player)) {
          this.projectiles().remove(projectile)
        }
        if (projectile.isHit(player)) {
          player.kill()
          this.projectiles().removeByPlayer(player)
          if (projectile.type !== PowerType.BOMB) this.projectiles().remove(projectile)
        }
      }

      if (player.move.l) {
        player.x -= player.sw
        if (solids.find(t => player.isColliding(t))) player.x += player.sw
      }
      if (player.move.r) {
        player.x += player.sw
        if (solids.find(t => player.isColliding(t))) player.x -= player.sw
      }
      if (player.move.u && player.canJump() && !solids.find(t => player.isColliding(t))) {
        player.vy -= player.sj
        player.grounded = false
      }
      player.vy += player.gravity * delta
      player.x += player.vx
      player.y += player.vy


      const solid = solids.find(t => player.isColliding(t))
      if (solid && player.isWalkingOn(solid) && player.vy > 0) {
        player.y = solid.y - player.height
        player.vy = 0
        player.grounded = true
      } else if (solid && player.vy <= 0) {
        player.y = solid.y + solid.height
        player.vy = 0
        player.grounded = false
      }

      const semi_solid = semi_solids.find(t => player.isWalkingOn(t))
      if (semi_solid && player.vy > 0 && (player.y + player.height) < (semi_solid.y + semi_solid.height * .25)) {
        // If y-velocity is higher than 0 (falling) and player collides with top of semi_solid block
        player.y = semi_solid.y - player.height
        player.vy = 0
        player.grounded = true
      }
      for (const power_tile of power_up_spawns) {
        if (power_tile.power_up && player.isTouching(power_tile) && player.addPowerUp(power_tile.power_up)) {
          power_tile.power_up = undefined
        }
      }
      if (player.died === undefined && this.world().isPlayerInVoid(player)) {
        player.kill()
        this.projectiles().removeByPlayer(player)
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
      const spawn = this.world().pickRandomSpawnPoint()
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
    if (this.running) setTimeout(() => this.loop(run), 1000 / TICKS)
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
    player.usePowerUp(powerUp)
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