import {TileLayerModel} from "./model/TileModel"
import PlayerModel from "./model/PlayerModel"

export default class Data {

  private ID: string = ""
  private VERSION: string = ""
  private MAP: TileLayerModel[] = []
  private PLAYERS: PlayerModel[] = []

  setID = (id: string) => this.ID = id

  id = () => this.ID

  setVersion = (version: string) => this.VERSION = version

  version = () => this.VERSION

  setMap = (map: TileLayerModel[]) => this.MAP = map

  map = () => this.MAP

  setPlayers = (players: PlayerModel[]) => {
    const uuids = players.map(p => p.i)
    this.PLAYERS = this.PLAYERS.filter(p => uuids.includes(p.i))
    for (const p in players) {
      const player = players[p]
      const PLAYER = this.PLAYERS[p] || null
      player.a = PLAYER?.a || 0
      this.PLAYERS[p] = player
    }
  }

  players = () => this.PLAYERS
}