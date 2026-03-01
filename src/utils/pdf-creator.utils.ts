import { PassThrough, Readable } from 'stream'
import { LibraryEntity } from '../resources/libraries/libraries.entity'
import { UserBookEntity } from '../resources/user-books/user-books.entity'
import PDFDocument from 'pdfkit'

function addHorizontalRule (doc: PDFKit.PDFDocument, spaceFromEdge = 0, linesAboveAndBelow = 0.5): void {
  doc.moveDown(linesAboveAndBelow)

  doc
    .moveTo(0 + spaceFromEdge, doc.y)
    .lineTo(doc.page.width - spaceFromEdge, doc.y)
    .stroke()

  doc.moveDown(linesAboveAndBelow)
}

function setTitleAndDescription (doc: PDFKit.PDFDocument, library: LibraryEntity, totalBooks: number): void {
  doc.fontSize(20)
    .text(library.name, { align: 'center' })
    .fontSize(10)

  doc.fontSize(12)
    .text(library.description ?? '', { align: 'center' })

  doc.text(`Libros totales: ${totalBooks}`, { align: 'center' })

  doc.fontSize(10)

  doc.moveDown(1)
}

function addTable (doc: PDFKit.PDFDocument, books: readonly UserBookEntity[]): void {
  const columnStylesMap = new Map<number, { header: string, width: number, padding: number }>([
    [0, { header: 'Título', width: 180, padding: 5 }],
    [1, { header: 'Autor/es', width: 180, padding: 5 }],
    [2, { header: 'Isbn-13', width: 100, padding: 5 }],
    [3, { header: 'Isbn-10', width: 80, padding: 5 }]
  ])

  doc.table({
    rowStyles: (i) => {
      return i < 1
        ? { border: [0, 0, 2, 0], borderColor: 'black' }
        : { border: [0, 0, 1, 0], borderColor: '#aaa' }
    },
    columnStyles: (i) => {
      return columnStylesMap.get(i) ?? { width: 100, padding: 5 }
    },
    data: [
      Array.from(columnStylesMap.values()).map(col => col.header),
      ...books.map(book => [
        book.bookTitle,
        book.bookAuthors.join(', '),
        book.bookIsbn13,
        book.bookIsbn10 ?? '-'
      ])
    ]
  })
}

function addPagination (doc: PDFKit.PDFDocument): void {
  // Global Edits to All Pages (Header/Footer, etc)
  const pages = doc.bufferedPageRange()
  for (let i = 0; i < pages.count; i++) {
    doc.switchToPage(i)

    // Footer: Add page number
    const oldBottomMargin = doc.page.margins.bottom
    doc.page.margins.bottom = 0 // Dumb: Have to remove bottom margin in order to write into it
    doc
      .text(
          `${i + 1}/${pages.count}`,
          0,
          doc.page.height - (oldBottomMargin / 2), // Centered vertically in bottom margin
          { align: 'center' }
      )
    doc.page.margins.bottom = oldBottomMargin // ReProtect bottom margin
  }
}

export async function createLibraryBooksPDF (library: LibraryEntity, books: readonly UserBookEntity[]): Promise<Readable> {
  const doc = new PDFDocument({ margins: { top: 25, bottom: 25, left: 25, right: 25 }, bufferPages: true })

  setTitleAndDescription(doc, library, books.length)

  addHorizontalRule(doc, 0, 1)

  addTable(doc, books)

  addPagination(doc)

  doc.end()

  const passThrough = new PassThrough()

  doc.pipe(passThrough)

  return passThrough
}
