import config from '../../../config.js'
import { RoboHashApiError } from './robohash.api.error.js'

class RoboHashApi {
  private readonly baseUrl: URL

  constructor (baseUrl: URL) {
    this.baseUrl = baseUrl
  }

  async getImage (input: string, size: { x: number, y: number } = { x: 100, y: 100 }): Promise<ArrayBuffer> {
    const url = new URL(input, this.baseUrl)
    url.searchParams.set('size', `${size.x}x${size.y}`)

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 5000)

    let response: Response

    try {
      response = await fetch(url, { signal: controller.signal })
    } catch (error: unknown) {
      throw new RoboHashApiError('Network error while fetching RoboHash image')
    } finally {
      clearTimeout(timeout)
    }

    if (!response.ok) {
      throw new RoboHashApiError(`RoboHash API returned ${response.status}`, response.status)
    }

    const contentType = response.headers.get('content-type')

    if (contentType?.startsWith('image/') !== true) {
      throw new RoboHashApiError('Invalid content type')
    }

    return await response.arrayBuffer()
  }
}

export default new RoboHashApi(config.roboHashApi.baseUrl)
