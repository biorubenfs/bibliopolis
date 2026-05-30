import { Router } from 'express'
import { z } from 'zod'
import handler from '../../handler.js'
import { HttpStatusCode } from '../../types.js'
import { CollectionResultObject, SingleResultObject } from '../../results.js'
import { queryPaginationValidator } from '../../middlewares/pagination-validator.middleware.js'
import { queryParamsValidator } from '../../middlewares/query-params-validator.middleware.js'
import { parseSkipLimitQP } from '../../utils.js'
import jobDao from './job.dao.js'
import { JobNotFoundError } from './job.error.js'
import { JobType } from './job.interfaces.js'

const jobsQuerySchema = z.object({
  resourceId: z.string().optional(),
  type: z.nativeEnum(JobType).optional()
})

const jobsRouter = Router()

jobsRouter.get('/', queryParamsValidator(jobsQuerySchema), queryPaginationValidator, handler(async (req) => {
  const { resourceId, type } = jobsQuerySchema.parse(req.query)
  const page = parseSkipLimitQP(req)
  const filters = { resourceId, jobType: type }

  const [jobs, total] = await Promise.all([
    jobDao.list(req.userId ?? '', filters, page.skip, page.limit),
    jobDao.count(req.userId ?? '', filters)
  ])

  return { status: HttpStatusCode.OK, data: new CollectionResultObject(jobs, { ...page, total }) }
}))

jobsRouter.get('/:id', handler(async (req) => {
  const job = await jobDao.findById(req.params.id)

  if (job == null || job.userId !== req.userId) {
    throw new JobNotFoundError('job not found')
  }

  return { status: HttpStatusCode.OK, data: new SingleResultObject(job) }
}))

export default jobsRouter
