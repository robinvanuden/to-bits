export interface ExplosionModel {
  x: number
  y: number
  w: number
  h: number
}

export default interface EntityModel {
  id: string
  p: string
  t: string
  s: number
  x: number
  y: number
  vx: number
  vy: number
  w: number
  h: number
  e: ExplosionModel | undefined
}