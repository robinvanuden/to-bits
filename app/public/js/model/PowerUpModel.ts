export enum PowerType {ARROW, BOOMERANG, BOMB, FIREBALL, SWORD, HEALTH}

export default interface PowerUpModel {
  id: string
  t: PowerType
  u: number
}