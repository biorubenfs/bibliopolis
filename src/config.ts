import 'dotenv/config'

function parseString (value?: string, dflt = ''): string {
  return value ?? dflt
}

function parseNumber (value?: string, dflt = 0): number {
  return value != null ? parseInt(value) : dflt
}

export default {
  environment: process.env.ENVIRONMENT,
  mongo: {
    uri: parseString(process.env.MONGO_URI)
  },
  defaultAdmin: {
    name: parseString(process.env.DEFAULT_ADMIN_NAME),
    email: parseString(process.env.DEFAULT_ADMIN_EMAIL),
    password: parseString(process.env.DEFAULT_ADMIN_PASSWORD)
  },
  hashRounds: parseNumber(process.env.HASH_ROUNDS)
}
