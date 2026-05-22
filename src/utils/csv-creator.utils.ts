import { AggregationCursor, WithId } from 'mongodb'
import { DBUserBook } from '../resources/user-books/user-books.interfaces.js'
import { PassThrough, Readable } from 'stream'
import { UserBookEntity } from '../resources/user-books/user-books.entity.js'

const CSV_HEADERS = ['Título', 'Autor/es', 'Isbn13', 'Isbn10']

function escapeCsvField (value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n') || value.includes('\r')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

export async function createLibraryBooksCSVStream (
  booksCursor: AggregationCursor<WithId<DBUserBook>>
): Promise<Readable> {
  const passThrough = new PassThrough()

  passThrough.push(CSV_HEADERS.map(escapeCsvField).join(',') + '\r\n')

  void (async () => {
    try {
      for await (const dbUserBook of booksCursor) {
        const book = new UserBookEntity(dbUserBook)
        const row = [
          book.bookTitle,
          book.bookAuthors.join(', '),
          book.bookIsbn13,
          book.bookIsbn10 ?? ''
        ].map(escapeCsvField).join(',') + '\r\n'
        passThrough.push(row)
      }
      passThrough.end()
    } catch (err) {
      passThrough.destroy(err instanceof Error ? err : new Error(String(err)))
    }
  })()

  return passThrough
}
