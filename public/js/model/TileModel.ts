export default interface TileModel {
  x: number
  y: number
  w: number // width
  h: number // height
  t: number // type
  c: string // color
  i: string | undefined
  d: number // damage
  sp: boolean // spawn
  wa: boolean // walkable
  so: boolean // solid
}