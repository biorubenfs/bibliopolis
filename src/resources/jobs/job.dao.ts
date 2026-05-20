import { ulid } from 'ulid'
import Dao from '../../dao.js'
import { DBJob, JobReport, JobStatus, JobType } from './job.interfaces.js'
import { JobEntity } from './job.entity.js'

function dbJobToEntity (doc: DBJob | null): JobEntity | null {
  return doc == null ? null : new JobEntity(doc)
}

class JobDao extends Dao<DBJob> {
  constructor () {
    super('jobs')
  }

  async create (userId: string, jobType: JobType, total: number, initialSkipped: string[] = [], initialFailed: string[] = []): Promise<JobEntity> {
    const now = new Date()
    const doc: DBJob = {
      _id: ulid(),
      userId,
      jobType,
      status: JobStatus.Pending,
      report: { total, imported: [], skipped: initialSkipped, failed: initialFailed },
      createdAt: now,
      updatedAt: now
    }
    await this.collection.insertOne(doc)
    return new JobEntity(doc)
  }

  async findById (id: string): Promise<JobEntity | null> {
    const doc = await this.collection.findOne({ _id: id })
    return dbJobToEntity(doc)
  }

  async updateStatus (id: string, status: JobStatus): Promise<void> {
    await this.collection.updateOne(
      { _id: id },
      { $set: { status, updatedAt: new Date() } }
    )
  }

  async complete (id: string, report: JobReport): Promise<void> {
    await this.collection.updateOne(
      { _id: id },
      { $set: { status: JobStatus.Completed, report, updatedAt: new Date() } }
    )
  }

  async fail (id: string): Promise<void> {
    await this.collection.updateOne(
      { _id: id },
      { $set: { status: JobStatus.Failed, updatedAt: new Date() } }
    )
  }
}

export default new JobDao()
