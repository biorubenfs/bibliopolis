enum TESTS_PORTS {
  INIT_PORT = 3001,
  AUTH_PORT = 3002,
  USERS_PORT = 3003,
  BOOKS_PORT = 3004,
  LIBRARIES_PORT = 3005,
}

async function getUserToken (loginUrl: URL, email: string, password: string): Promise<string> {
  const response = await fetch(loginUrl, {
    headers: { 'Content-Type': 'application/json' },
    method: 'POST',
    body: JSON.stringify({ email, password })
  })

  const body = await response.json()
  const token: string = body.results.attributes.token

  return token
}

function buildBearer (token: string): string {
  return `Bearer ${token}`
}

const testUtils = { getUserToken, buildBearer, TESTS_PORTS }

export default testUtils
