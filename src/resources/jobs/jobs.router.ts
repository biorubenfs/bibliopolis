import { Router } from 'express'
import handler from '../../handler.js'
import { HttpStatusCode } from '../../types.js'
import { SingleResultObject } from '../../results.js'
import jobDao from './job.dao.js'
import { JobNotFoundError } from './job.error.js'

const jobsRouter = Router()

jobsRouter.get('/:id', handler(async (req) => {
  const job = await jobDao.findById(req.params.id)

  if (job == null || job.userId !== req.userId) {
    throw new JobNotFoundError('job not found')
  }

  return { status: HttpStatusCode.OK, data: new SingleResultObject(job) }
}))

export default jobsRouter
