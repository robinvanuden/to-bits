export enum PowerType {BOMB, FIREBALL, HEALTH}

export default interface PowerUpModel {
  id: string
  t: PowerType
  u: number
}