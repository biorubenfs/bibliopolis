import { Request, Response, NextFunction } from 'express'
import { CollectionResultObject, SingleResultObject, MiscResultObject } from './results.js'
import { Entity, EntityType } from './entity.js'

type CustomController = (req: Request) => Promise<SingleResultObject<Entity<EntityType>> | CollectionResultObject<Entity<EntityType>> | MiscResultObject>

function tryCatch (controller: CustomController) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const resultObject = await controller(req)
      if (resultObject instanceof CollectionResultObject) {
        res.status(200).json({ results: resultObject.entities.map(r => r.toResult()), paginationInfo: resultObject.paginationInfo })
      }
      if (resultObject instanceof SingleResultObject) {
        res.status(200).json({ results: resultObject.entity.toResult() })
      }
      if (resultObject instanceof MiscResultObject) {
        res.status(200).json({ results: resultObject.toResult() })
      }
    } catch (error) {
      next(error)
    }
  }
}

export default tryCatch
