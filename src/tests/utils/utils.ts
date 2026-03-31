const TESTS_PORT = 3001
const TESTS_BASE_URL = `http://localhost:${TESTS_PORT}`

/**
 * Builds Authorization header with Bearer token for authenticated requests
 */
function buildAuthorizationHeader (accessToken: string): string {
  return `Bearer ${accessToken}`
}

/**
 * Helper to perform login and get access token
 */
async function login (email: string, password: string): Promise<{ accessToken: string, refreshTokenCookie: string }> {
  const loginUrl = new URL('/auth/login', TESTS_BASE_URL)
  const response = await fetch(loginUrl, {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: JSON.stringify({ email, password })
  })

  const body = await response.json()
  const cookies = response.headers.getSetCookie()
  const refreshTokenCookie = cookies.find(cookie => cookie.startsWith('refresh_token=')) ?? ''

  return {
    accessToken: body.results.attributes.accessToken,
    refreshTokenCookie
  }
}

const testUtils = {
  buildAuthorizationHeader,
  login,
  TESTS_PORT,
  TESTS_BASE_URL
}

export default testUtils
