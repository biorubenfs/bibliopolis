import { schedule, ScheduledTask } from 'node-cron'
import logger from '../logger.js'
import { syncBooksFromSources } from './update-incomplete-books.task.js'

interface CronTaskDefinition {
  name: string
  schedule: string
  enabled: boolean
  task: () => Promise<void>
}

const cronTasks: CronTaskDefinition[] = [
  {
    name: 'sync-books-from-sources',
    schedule: '0 3 * * 6', // every Saturday at 3:00 AM
    enabled: true,
    task: syncBooksFromSources
  }
]

export function startCronTasks (): ScheduledTask[] {
  const scheduledTasks: ScheduledTask[] = []

  for (const definition of cronTasks) {
    if (!definition.enabled) {
      logger.info(`[ task ] task disabled ${definition.name}, skipping`)
      continue
    }

    const scheduled = schedule(definition.schedule, async () => {
      logger.info(`[ task ] task started ${definition.name}`)
      try {
        await definition.task()
        logger.info(`[ task ] task finished ${definition.name}`)
      } catch (err) {
        logger.error(`[ task ] task failed ${definition.name}`, err)
      }
    })

    scheduledTasks.push(scheduled)
    logger.info(`[ task ] task scheduled ${definition.name}, schedule: ${definition.schedule}`)
  }

  return scheduledTasks
}
