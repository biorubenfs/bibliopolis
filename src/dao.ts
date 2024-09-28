import { Collection, Document } from 'mongodb'
import mongo from './mongo.js'

export default abstract class Dao<T extends Document> {
  readonly collectionName: string

  constructor (collectionName: string) {
    this.collectionName = collectionName
  }

  get collection (): Collection<T> {
    return mongo.db().collection(this.collectionName)
  }
}
