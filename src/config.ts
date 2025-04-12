import 'dotenv/config'

function parseString (value?: string, dflt = ''): string {
  return value ?? dflt
}

function parseNumber (value?: string, dflt = 0): number {
  return value != null ? parseInt(value) : dflt
}

function parseUrl (value?: string, dflt = ''): URL {
  return new URL(value ?? dflt)
}

export default {
  environment: parseString(process.env.ENVIRONMENT, 'dev'),
  port: parseNumber(process.env.PORT, 3000),
  mongo: {
    uri: parseString(process.env.MONGO_URI)
  },
  defaultAdmin: {
    name: parseString(process.env.DEFAULT_ADMIN_NAME),
    email: parseString(process.env.DEFAULT_ADMIN_EMAIL),
    password: parseString(process.env.DEFAULT_ADMIN_PASSWORD)
  },
  jwt: {
    secret: parseString(process.env.JWT_SECRET, 'foo')
  },
  hashRounds: parseNumber(process.env.HASH_ROUNDS, 10),
  openLibrary: {
    domain: parseUrl(process.env.OPEN_LIBRARY_DOMAIN),
    coverUrlPattern: parseString(process.env.OPEN_LIBRARY_COVER_URL_PATH)
  }
}
