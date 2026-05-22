export function parseIsbnColumn (csvContent: string): string[] {
  const lines = csvContent.split(/\r?\n/)
  if (lines.length === 0) return []

  const validIsbnHeaders = ['isbn', 'isbn13', 'isbn10']
  const headers = parseCsvLine(lines[0])
  const isbnIndex = headers.findIndex(h => validIsbnHeaders.includes(h.trim().toLowerCase()))
  if (isbnIndex === -1) return []

  const isbns: string[] = []
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line === '') continue
    const fields = parseCsvLine(line)
    const isbn = fields[isbnIndex]?.trim()
    if (isbn != null && isbn !== '') {
      isbns.push(isbn)
    }
  }

  return isbns
}

function parseCsvLine (line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      fields.push(current)
      current = ''
    } else {
      current += char
    }
  }
  fields.push(current)
  return fields
}
