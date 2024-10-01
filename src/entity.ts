export enum EntityType {
  Admins = 'admins'
}

export abstract class Entity<T extends EntityType> {
  readonly type: T
  readonly id: string
  abstract attributes (): Object

  constructor (type: T, id: string) {
    this.type = type
    this.id = id
  }
}
