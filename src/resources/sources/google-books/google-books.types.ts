export interface GoogleBooksVolumesResponse {
  items: readonly GoogleBooksVolume[]
}

export interface GoogleBooksVolume {
  id: string
  volumeInfo: {
    title: string
    authors?: string[]
    industryIdentifiers?: Array<{
      type: string
      identifier: string
    }>
    imageLinks?: {
      thumbnail: string
      smallThumbnail: string
    }
  }
}
