enum TESTS_PORTS {
  INIT_PORT = 3001,
  AUTH_PORT = 3002,
  USERS_PORT = 3003,
  BOOKS_PORT = 3004,
  LIBRARIES_PORT = 3005,
}

function buildAccessTokenCookie(token: string) {
  return `access_token=${token}`
}

const testUtils = { buildAccessTokenCookie, TESTS_PORTS }

export default testUtils
