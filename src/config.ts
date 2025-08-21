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

function parseBoolean(value?: string, dflt = false): boolean {
  return value != null ? value.toLowerCase() === 'true' : dflt
}

export default {
  environment: parseString(process.env.ENVIRONMENT, 'local'),
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
    secret: parseString(process.env.JWT_SECRET, 'foo'),
    expirationTime: parseNumber(process.env.JWT_EXPIRATION_TIME, 60000)
  },
  hashRounds: parseNumber(process.env.HASH_ROUNDS, 10),
  openLibrary: {
    domain: parseUrl(process.env.OPEN_LIBRARY_DOMAIN, 'https://openlibrary.org'),
    coverUrlPattern: parseString(process.env.OPEN_LIBRARY_COVER_URL_PATH)
  },
  cookieOptions: {
    httpOnly: true,
    secure: parseBoolean(process.env.ACCESS_TOKEN_COOKIE_SECURE, false),
    sameSite: parseString(process.env.ACCESS_TOKEN_COOKIE_SAME_SITE, 'none')
  },
  debug: {
    stackTrace: parseBoolean(process.env.DEBUG_STACK_TRACE, false)
  }
}
