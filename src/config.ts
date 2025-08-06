import { z } from 'zod'

const envSchema = z.object({
  ENVIRONMENT: z.string().default('dev'),
  PORT: z.string().default('3000').transform(value => parseInt(value)),
  MONGO_URI: z.string().default('mongodb://localhost:27017/bibliopolis'),
  // Default admin user
  DEFAULT_ADMIN_NAME: z.string().default('admin01'),
  DEFAULT_ADMIN_EMAIL: z.string().email().default('admin01@email.com'),
  DEFAULT_ADMIN_PASSWORD: z.string().default('Password123$'),
  // JWT configuration
  JWT_SECRET: z.string().default('supersecretkey'),
  EXPIRATION_TIME: z.string().optional().default('60000'),
  HASH_ROUNDS: z.string().optional().default('10').transform(value => parseInt(value)),
  // Open Library config
  OPEN_LIBRARY_DOMAIN: z.string().optional().default('https://openlibrary.org').transform(value => new URL(value)),
  OL_COVER_URL_PATH: z.string().default('none'),
  // Cookie options
  COOKIE_OPTIONS_HTTP_ONLY: z.boolean().optional().default(true),
  COOKIE_OPTIONS_SECURE: z.boolean().optional().default(false),
  COOKIE_OPTIONS_SAME_SITE: z.string().optional().default('none')
})

const { data, error, success } = envSchema.safeParse(process.env)

if (!success) {
  console.log(error.issues)
  throw new Error('invalid environment config')
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
    expirationTime: data.EXPIRATION_TIME,
    secret: data.JWT_SECRET
  },
  hashRounds: data.HASH_ROUNDS,
  openLibrary: {
    domain: data.OPEN_LIBRARY_DOMAIN,
    coverUrlPattern: data.OL_COVER_URL_PATH
  },
  cookieOptions: {
    httpOnly: data.COOKIE_OPTIONS_HTTP_ONLY,
    secure: data.COOKIE_OPTIONS_SECURE,
    sameSite: data.COOKIE_OPTIONS_SAME_SITE
  }
}
