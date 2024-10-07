import { z } from 'zod'
import { LibraryEntity } from './libraries.entity'
import { newLibrarySchema } from './libraries.schemas'

export type NewLibrary = z.infer<typeof newLibrarySchema>
export type DBLibrary = Omit<LibraryEntity, 'id' | 'type' | 'attributes' | 'toResult'> & { _id: string }
