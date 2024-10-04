import { Request, Response, NextFunction } from 'express'

import { CollectionResultObject, SingleResultObject } from './results.js'

type CustomController = (req: Request, res: Response, next: NextFunction) => Promise<SingleResultObject | CollectionResultObject>

function tryCatch (controller: CustomController) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const result = await controller(req, res, next)
      if (result instanceof CollectionResultObject) {
        res.status(200).json({ results: result.results.map(r => r.toResult()), paginationInfo: result.paginationInfo })
      }
      if (result instanceof SingleResultObject) {
        res.status(200).json({ results: result.results.toResult() })
      }
    } catch (error) {
      next(error)
    }
  }
}

export default tryCatch
