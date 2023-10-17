export default class PlayerModel {
  w = 0
  h = 0
  x = 0
  y = 0
  name = "-"
  color = "red"

  constructor({x, y, w, h, name, color}) {
    this.w = w
    this.h = h
    this.x = x
    this.y = y
    this.name = name
    this.color = color
  }
}