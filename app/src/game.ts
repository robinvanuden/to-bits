import PlayerRepository from "./repository/PlayerRepository"
import {v4, v5} from "uuid"
import WorldLoader, {useWorld1} from "./world/WorldLoader"
import EntityRepository from "./repository/EntityRepository"
import {PowerType} from "./entities/PowerUp"
import {TICKS} from "./constants"

export default class Game {

  private readonly VERSION: string = "?.?.?"

  private UUID_SEED: string = ""

  private playerRepository!: PlayerRepository
  private entityRepository!: EntityRepository

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

  entities = () => this.entityRepository

  setEntityRepository = (entities: EntityRepository) => this.entityRepository = entities

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
      // New player_id
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

    for (const player of this.players().alive()) {
      // Player loop
      for (const entity of this.entities().list()) {
        if (entity.remove(player)) {
          this.entities().remove(entity)
        }
        if (entity.kills(player)) {
          player.kill()
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
      if (solid && player.vy > 0 && player.isWalkingOn(solid)) {
        player.y = solid.y - player.height
        player.vy = 0
        player.grounded = true
      } else if (solid && player.vy > 0) {
        player.y = solid.y - player.height
        player.vy = 0
        player.grounded = true
      } else if (solid && player.vy <= 0) {
        player.y = solid.y + solid.height
        player.vy = 0
        player.grounded = false
      }

      if (player.move.d && semi_solids.find(t => player.isWalkingOn(t))) {
        player.vy += player.gravity * delta
      }

      const semi_solid = semi_solids.find(t => player.isWalkingOn(t))
      if (!player.move.d && semi_solid && player.vy > 0) {
        // If y-velocity is higher than 0 (falling)
        player.y = semi_solid.y - player.height
        player.vy = 0
        player.grounded = true
      }

      for (const power_tile of power_up_spawns) {
        if (player.isTouching(power_tile) && player.addPowerUp(power_tile.power_up)) {
          power_tile.power_up = undefined
        }
      }
      if (this.world().isPlayerInVoid(player)) {
        player.kill()
      }
    }

    for (const entity of this.entities().list()) {
      // Entity loop
      entity.vy += entity.gravity * delta
      entity.x += entity.vx
      entity.y += entity.vy

      const solid = solids.find(t => entity.isColliding(t))
      const semi_solid = semi_solids.find(t => entity.isWalkingOn(t))
      if (solid && !entity.isProjectile && entity.vy > 0 && entity.isWalkingOn(solid)) {
        entity.y = solid.y - entity.height
        entity.vx = 0
        entity.vy = 0
      }
      if (semi_solid && entity.isExplosive && entity.vy > 0) {
        entity.y = semi_solid.y - entity.height
        entity.vx = 0
        entity.vy = 0
      } else if (!entity.isExplosive && solids.find(entity.isColliding)) {
        this.entities().remove(entity)
      }
    }
  }

  private checkDisconnectedPlayers = () => {
    for (const player of this.players().disconnected()) {
      console.log("Remove player_id: " + player.id)
      this.players().remove(player)
    }
  }

  private checkRespawnPlayers = () => {
    for (const player of this.players().respawns()) {
      console.log("Respawn player_id: " + player.id)
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
    switch (powerUp.type()) {
      case PowerType.BOOMERANG:
        this.entities().throwBoomerang(player, degrees)
        break
      case PowerType.BOMB:
        this.entities().placeBomb(player)
        break
      case PowerType.FIREBALL:
        this.entities().throwFireball(player, degrees)
        break

    }
  }
}