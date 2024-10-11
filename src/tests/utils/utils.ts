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

const testUtils = { getUserToken, buildBearer }

export default testUtils
