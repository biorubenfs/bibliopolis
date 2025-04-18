import { Request, Response, NextFunction, RequestHandler, Router } from 'express'
import { CollectionResultObject, SingleResultObject, MiscResultObject, SetCookieResultObject, ClearCookieResultObject } from './results.js'
import { Entity, EntityType } from './entity.js'
import { HttpStatusCode } from './types.js'
import { z, ZodSchema } from 'zod'
import usersService from './resources/users/users.service.js'

type StatusCustomController = HttpStatusCode
type DataCustomController =
  SingleResultObject<Entity<EntityType>> |
  CollectionResultObject<Entity<EntityType>> |
  MiscResultObject |
  SetCookieResultObject<Entity<EntityType>> |
  ClearCookieResultObject |
  null

const exampleRouter = Router()

const params = ['id']
const _params = z.object({ id: z.string() })
const schema = z.object({ name: z.string(), email: z.string(), password: z.string() })
const query = ['skip', 'limit']
const _query = z.object({ skip: z.string().transform(val => parseInt(val)), limit: z.string().transform(val => parseInt(val)) })

exampleRouter.post('/:id', handler(params, schema, query, async (params, body, query) => {
  await usersService.signup(body)

  return { status: 200, data: null }
}))

exampleRouter.post('/:id', fullHandler(_params, schema, _query, async (params, body, query) => {
  await usersService.signup(body)
  await usersService.getById(params.id)
  await usersService.list(query)

  return { status: 200, data: null }
}))

type TypedCustomController<_TParams, _TBody, _TQuery> = (params: _TParams, body: _TBody, query: _TQuery) => Promise<{ status: StatusCustomController, data: DataCustomController }>

function handler<_TParams, _TSchema extends ZodSchema, _TQuery> (params: _TParams, schema: _TSchema, query: _TQuery, controller: TypedCustomController<_TParams, z.infer<_TSchema>, _TQuery>): RequestHandler<_TParams, any, z.infer<ZodSchema>, _TQuery> {
  return async function (req, res, next) {
    // validate params

    // validate query

    // validate body
    const validationResult = schema.safeParse(req.body)
    if (!validationResult.success) {
      throw new Error('invalid body')
    }

    try {
      const { status, data } = await controller(req.params, req.body, req.query)

      switch (true) {
        case data instanceof CollectionResultObject:
          res.status(status)
            .json({
              results: data.entities.map(entity => entity.toResult()),
              paginationInfo: data.paginationInfo
            })
          return

        case data instanceof SingleResultObject:
          res.status(status)
            .json({ results: data.entity.toResult() })
          return

        case data instanceof MiscResultObject:
          res.status(status)
            .json({ results: data.toResult() })
          return

        case data instanceof SetCookieResultObject:
          res.cookie(data.name, data.value, data.options)
            .status(status)
            .json(data.entity.toResult())
          return

        case data instanceof ClearCookieResultObject:
          res.clearCookie(data.name, data.options)
            .status(status)
          return

        case data == null:
          res.sendStatus(status)
          return

        default:
          /* maybe we should throw and error or log something, although all cases are covered */
          res.sendStatus(200)
      }
    } catch (error) {
      next(error)
    }
  }
}

function fullHandler<
  _TParamsSchema extends ZodSchema,
  _TBodySchema extends ZodSchema,
  _TQuerySchema extends ZodSchema
> (paramsSchema: _TParamsSchema, bodySchema: _TBodySchema, querySchema: _TQuerySchema, controller: TypedCustomController<z.infer<_TParamsSchema>, z.infer<_TBodySchema>, z.infer<_TQuerySchema>>): RequestHandler<z.infer<_TParamsSchema>, any, z.infer<ZodSchema>, z.infer<_TQuerySchema>> {
  return async function (req, res, next) {
    // validate params
    const valParamsResult = paramsSchema.safeParse(req.params)
    if (!valParamsResult.success) {
      throw new Error('invalid body')
    }

    // validate query
    const valQueryResult = querySchema.safeParse(req.query)
    if (!valQueryResult.success) {
      throw new Error('invalid body')
    }

    // validate body
    const valBodyResult = bodySchema.safeParse(req.body)
    if (!valBodyResult.success) {
      throw new Error('invalid body')
    }

    try {
      const { status, data } = await controller(req.params, req.body, req.query)

      switch (true) {
        case data instanceof CollectionResultObject:
          res.status(status)
            .json({
              results: data.entities.map(entity => entity.toResult()),
              paginationInfo: data.paginationInfo
            })
          return

        case data instanceof SingleResultObject:
          res.status(status)
            .json({ results: data.entity.toResult() })
          return

        case data instanceof MiscResultObject:
          res.status(status)
            .json({ results: data.toResult() })
          return

        case data instanceof SetCookieResultObject:
          res.cookie(data.name, data.value, data.options)
            .status(status)
            .json(data.entity.toResult())
          return

        case data instanceof ClearCookieResultObject:
          res.clearCookie(data.name, data.options)
            .status(status)
          return

        case data == null:
          res.sendStatus(status)
          return

        default:
          /* maybe we should throw and error or log something, although all cases are covered */
          res.sendStatus(200)
      }
    } catch (error) {
      next(error)
    }
  }
}
type CustomController<TBody> = (req: Request<any, any, TBody>) => Promise<{ status: StatusCustomController, data: DataCustomController }>

function tryCatch<TBody> (controller: CustomController<TBody>): RequestHandler<any, any, TBody> {
  return async function (req: Request, res: Response, next: NextFunction) {
    try {
      const { status, data } = await controller(req)

      switch (true) {
        case data instanceof CollectionResultObject:
          res.status(status)
            .json({
              results: data.entities.map(entity => entity.toResult()),
              paginationInfo: data.paginationInfo
            })
          return

        case data instanceof SingleResultObject:
          res.status(status)
            .json({ results: data.entity.toResult() })
          return

        case data instanceof MiscResultObject:
          res.status(status)
            .json({ results: data.toResult() })
          return

        case data instanceof SetCookieResultObject:
          res.cookie(data.name, data.value, data.options)
            .status(status)
            .json(data.entity.toResult())
          return

        case data instanceof ClearCookieResultObject:
          res.clearCookie(data.name, data.options)
            .status(status)
          return

        case data == null:
          res.sendStatus(status)
          return

        default:
          /* maybe we should throw and error or log something, although all cases are covered */
          res.sendStatus(200)
      }
    } catch (error) {
      next(error)
    }
  }
}

export default tryCatch
