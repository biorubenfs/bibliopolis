import { Request, Response, NextFunction } from 'express'

type ExpressController = (req: Request, res: Response, next: NextFunction) => Promise<void>

function tryCatch (controller: ExpressController) {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      await controller(req, res, next)
    } catch (error) {
      next(error)
    }
  }
}

export default tryCatch
