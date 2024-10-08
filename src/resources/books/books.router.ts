import { NextFunction, Request, Response, Router } from 'express'
import tryCatch from '../../try-catch.js'
import bodyValidator from '../../middlewares/body-validator.middleware.js'
import { newBookSchema } from './books.schema.js'
import booksService from './books.service.js'
import { ZodSchema, z } from 'zod'
import { InvalidBodyError } from '../../error/errors.js'

const booksRouter = Router()

const paginationSchema = z.object({
    skip: z.string().optional()
        .transform((val) => parseInt(val ?? '0', 10))
        .refine(val => !isNaN(val) && val >= 0, 'skip must be of type number and >= 0'),
    limit: z.string().optional()
        .transform((val) => parseInt(val ?? '10', 10))
        .refine(val => !isNaN(val) && val > 0, 'limit must be of type number and >= 0') 
})

function queryPaginationValidator(schema: ZodSchema): (req: Request, res: Response, next: NextFunction) => void {
    return function (req: Request, res: Response, next: NextFunction): void {
        const paginationQueryValidationResult = schema.safeParse(req.query)
        if (!paginationQueryValidationResult.success) {
            throw new InvalidBodyError('invalid query params', paginationQueryValidationResult.error.issues)
        }
        
        req.query.skip = paginationQueryValidationResult.data.skip
        req.query.limit = paginationQueryValidationResult.data.limit

        next()
    }
}

booksRouter.post('/', bodyValidator(newBookSchema), tryCatch(async (req) => await booksService.create(req.body)))
booksRouter.get('/:id', tryCatch(async (req) => await booksService.getById(req.params.id)))
booksRouter.get('/', queryPaginationValidator(paginationSchema), tryCatch(async (req) => {
    const skip = req.query.skip as unknown as number
    const limit = req.query.limit as unknown as number
    return await booksService.list(skip , limit)
}))

export default booksRouter
