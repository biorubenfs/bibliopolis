import { z } from 'zod'

const envSchema = z.object({
  ENVIRONMENT: z.string().default('dev'),
  PORT: z.string().default('3000').transform(value => parseInt(value)),
  MONGO_URI: z.string(),
  DEFAULT_ADMIN_NAME: z.string(),
  DEFAULT_ADMIN_EMAIL: z.string().email(),
  DEFAULT_ADMIN_PASSWORD: z.string(),
  JWT_SECRET: z.string(),
  HASH_ROUNDS: z.string().optional().default('10').transform(value => parseInt(value)),
  OL_COVER_URL_PATH: z.string()
})

const { data, error, success } = envSchema.safeParse(process.env)

if (!success) {
  console.log(error.issues)
  throw new Error('invalid environment config')
}

function parseUrl (value?: string, dflt = ''): URL {
  return new URL(value ?? dflt)
}

export default {
  environment: data.ENVIRONMENT,
  port: data.PORT,
  mongo: {
    uri: data.MONGO_URI
  },
  defaultAdmin: {
    name: data.DEFAULT_ADMIN_NAME,
    email: data.DEFAULT_ADMIN_EMAIL,
    password: data.DEFAULT_ADMIN_PASSWORD
  },
  jwt: {
    secret: data.JWT_SECRET
  },
  hashRounds: data.HASH_ROUNDS,
  openLibrary: {
    coverUrlPattern: data.OL_COVER_URL_PATH
  }
}
