export default class SessionRepository {

  private list: string[] = []

  public add = (uuid: string): boolean => {
    if (this.list.includes(uuid)) {
      return false
    }
    this.list.push(uuid)
    return true
  }

  public contains = (uuid: string): boolean => this.list.includes(uuid)

  public remove = (uuid: string) => this.list = this.list.filter(uu => uu !== uuid)

}