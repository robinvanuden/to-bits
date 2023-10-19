export default class PlayerModel {
  id: string = ""
  w: number = 0
  h: number = 0
  x: number = 0
  y: number = 0
  vx: number = 0
  vy: number = 0
  jumping: boolean = false
  name: string = "-"
  color: string = "red"
  died: number | undefined = undefined
  move: Direction = {u: false, d: false, l: false, r: false}
  look: Direction = {u: false, d: false, l: false, r: false}
}

interface Direction {
  u: boolean
  d: boolean
  l: boolean
  r: boolean
}