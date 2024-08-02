import TextureModel from "./TextureModel"

export enum PowerType {ARROW, BOOMERANG, BOMB, FIREBALL, SWORD, HEALTH}

export default interface PowerUpModel {
  id: string
  t: TextureModel
  ty: PowerType
  u: number
}