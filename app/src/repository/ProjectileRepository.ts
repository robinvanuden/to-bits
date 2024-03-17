import Projectile from "../entities/Projectile"
import {PowerType} from "../entities/PowerUp"
import Player from "../entities/Player"

export default class ProjectileRepository {

  private projectiles: Projectile[] = []

  public list = () => this.projectiles

  public throwBoomerang = (player: Player, degrees: number) => {
    this.projectiles.push(Projectile.create(player, PowerType.BOOMERANG, degrees))
  }

  public throwFireball = (player: Player, degrees: number) => {
    this.projectiles.push(Projectile.create(player, PowerType.FIREBALL, degrees))
  }

  public placeBomb = (player: Player) => {
    this.projectiles.push(Projectile.create(player, PowerType.BOMB, 0))
  }

  public remove = (projectile: Projectile) => {
    this.projectiles = this.projectiles.filter(p => p.id !== projectile.id)
  }

  public removeByPlayer = (player: Player) => {
    this.projectiles = this.projectiles.filter(p => p.player !== player.id)
  }

}