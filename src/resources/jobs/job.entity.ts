import { Entity, EntityType } from '../../entity.js'
import { DBJob, JobReport, JobStatus, JobType } from './job.interfaces.js'

export class JobEntity extends Entity<EntityType.Jobs> {
  readonly userId: string
  readonly jobType: JobType
  readonly resourceId: string | null
  readonly status: JobStatus
  readonly report: JobReport
  readonly createdAt: Date
  readonly updatedAt: Date

  constructor (data: DBJob) {
    super(EntityType.Jobs, data._id)
    this.userId = data.userId
    this.jobType = data.jobType
    this.resourceId = data.resourceId
    this.status = data.status
    this.report = data.report
    this.createdAt = data.createdAt
    this.updatedAt = data.updatedAt
  }

  attributes (): Object {
    return {
      userId: this.userId,
      jobType: this.jobType,
      resourceId: this.resourceId,
      status: this.status,
      report: this.report,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}
