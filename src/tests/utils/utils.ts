const TESTS_PORT = 3001
const TESTS_BASE_URL = `http://localhost:${TESTS_PORT}`

function buildAccessTokenCookie (token: string): string {
  return `access_token=${token}`
}

const testUtils = { buildAccessTokenCookie, TESTS_PORT, TESTS_BASE_URL }

export default testUtils
