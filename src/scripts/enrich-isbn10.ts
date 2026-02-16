import { readFile, writeFile } from 'fs/promises'
import { join } from 'path'

interface Book {
  _id: string
  title: string
  authors: string[]
  cover: number | null
  isbn13: string
  createdAt: string
  updatedAt: string
  isbn10: string | null
}

interface OpenLibraryResponse {
  title?: string
  isbn10?: string[]
  isbn13?: string[]
  covers?: number[]
}

const OPEN_LIBRARY_API = 'https://openlibrary.org'
const BOOKS_FILE_PATH = join(process.cwd(), 'data', 'seed', 'books.json')
const DELAY_MS = 500 // Delay entre peticiones para no sobrecargar la API

async function fetchISBN10 (isbn13: string): Promise<string | null> {
  try {
    const url = `${OPEN_LIBRARY_API}/isbn/${isbn13}.json`
    console.log(`Fetching: ${url}`)

    const response = await fetch(url)

    if (response.status === 404) {
      console.log(`  ⚠️  ISBN ${isbn13} no encontrado en Open Library`)
      return null
    }

    if (!response.ok) {
      console.log(`  ❌ Error ${response.status} para ISBN ${isbn13}`)
      return null
    }

    const data: OpenLibraryResponse = await response.json()

    if ((data.isbn10 != null) && data.isbn10.length > 0) {
      console.log(`  ✓ ISBN-10 encontrado: ${data.isbn10[0]}`)
      return data.isbn10[0]
    }

    console.log(`  ⚠️  No hay ISBN-10 disponible para ${isbn13}`)
    return null
  } catch (error) {
    console.error(`  ❌ Error al consultar ISBN ${isbn13}:`, error)
    return null
  }
}

async function delay (ms: number): Promise<void> {
  return await new Promise(resolve => setTimeout(resolve, ms))
}

async function enrichBooks (): Promise<void> {
  console.log('📚 Iniciando enriquecimiento de libros con ISBN-10...\n')

  // Leer el archivo de libros
  const fileContent = await readFile(BOOKS_FILE_PATH, 'utf-8')
  const books: Book[] = JSON.parse(fileContent)

  console.log(`Total de libros: ${books.length}`)
  const booksToEnrich = books.filter(book => book.isbn10 === null)
  console.log(`Libros sin ISBN-10: ${booksToEnrich.length}\n`)

  let enrichedCount = 0
  let notFoundCount = 0
  let errorCount = 0

  // Procesar cada libro
  for (let i = 0; i < books.length; i++) {
    const book = books[i]

    if (book.isbn10 !== null) {
      console.log(`[${i + 1}/${books.length}] "${book.title}" - Ya tiene ISBN-10: ${book.isbn10}`)
      continue
    }

    console.log(`[${i + 1}/${books.length}] "${book.title}" (ISBN-13: ${book.isbn13})`)

    const isbn10 = await fetchISBN10(book.isbn13)

    if (isbn10 != null) {
      books[i].isbn10 = isbn10
      enrichedCount++
    } else if (isbn10 === null) {
      notFoundCount++
    } else {
      errorCount++
    }

    // Delay para no saturar la API
    if (i < books.length - 1) {
      await delay(DELAY_MS)
    }

    console.log('')
  }

  // Guardar el archivo actualizado
  console.log('💾 Guardando archivo actualizado...')
  await writeFile(
    BOOKS_FILE_PATH,
    JSON.stringify(books, null, 4) + '\n',
    'utf-8'
  )

  console.log('\n✅ Proceso completado!')
  console.log(`  📗 Enriquecidos: ${enrichedCount}`)
  console.log(`  ⚠️  No encontrados: ${notFoundCount}`)
  console.log(`  ❌ Errores: ${errorCount}`)
  console.log(`  📊 Total procesados: ${books.length}`)
}

enrichBooks().catch(error => {
  console.error('Error fatal:', error)
  process.exit(1)
})
