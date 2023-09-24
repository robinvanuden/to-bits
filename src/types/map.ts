export interface Map {
  w: number
  h: number,
  t: Tile[]
}

export interface Tile {
  t: number
  w: number
  h: number
  x: number
  y: number,
  c: string
}