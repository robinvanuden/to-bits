import TileModel from "./model/TileModel"
import PowerUpModel from "./model/PowerUpModel"
import PlayerModel from "./model/PlayerModel"

export default class Data {

  private ID: string = ""
  private VERSION: string = ""
  private MAP: TileModel[] = []
  private POWER_UPS: PowerUpModel[] = []
  private PLAYERS: PlayerModel[] = []

  setID = (id: string) => this.ID = id

  id = () => this.ID

  setVersion = (version: string) => this.VERSION = version

  version = () => this.VERSION

  setPlayers = (players: PlayerModel[]) => this.PLAYERS = players

  setPowerUps = (powers: PowerUpModel[]) => this.POWER_UPS = powers

  setMap = (map: TileModel[]) => this.MAP = map

  map = () => this.MAP

  players = () => this.PLAYERS

  power_ups = () => this.POWER_UPS


}