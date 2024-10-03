import { Request, Response } from 'express'
import { z } from 'zod'
import { createUserSchema } from './users.schemas.js'
import ApiError from '../../error/error.js'
import { ApiErrors } from '../../error/types.js'

type CreateUser = z.infer<typeof createUserSchema>

class UserService {
  async createUser (req: Request, res: Response): Promise<void> {
    /* eslint-disable @typescript-eslint/no-unused-vars */
    const body: CreateUser = req.body

    throw new ApiError(ApiErrors.NotFoundError, 404, 'not found')
  }
}

export default new UserService()
