import { JobEntity } from './job.entity.js'

export enum JobStatus {
  Pending = 'pending',
  InProgress = 'in_progress',
  Completed = 'completed',
  Failed = 'failed'
}

export enum JobType {
  LibraryCsvImport = 'library_csv_import'
}

export interface JobReport {
  total: number
  imported: string[]
  skipped: string[]
  failed: string[]
}

export type DBJob = Omit<JobEntity, 'id' | 'type' | 'attributes' | 'toResult'> & { _id: string }
