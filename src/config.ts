import 'dotenv/config'

function parseString (value?: string, dflt = ''): string {
  return value ?? dflt
}

export default {
  mongo: {
    uri: parseString(process.env.MONGO_URI)
  }
}
