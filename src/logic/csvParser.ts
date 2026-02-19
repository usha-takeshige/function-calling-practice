import type { Dataset } from '../types'

export class ParseError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ParseError'
    }
}

export function parse(csvString: string): Dataset {
    if (csvString === '') {
        return { headers: [], rows: [] }
    }

    const lines = csvString.split('\n')
    const headers = lines[0].split(',')
    const columnCount = headers.length

    const rows = lines.slice(1).map((line, i) => {
        const cells = line.split(',')
        if (cells.length !== columnCount) {
            throw new ParseError(
                `Row ${i + 1} has ${cells.length} columns, expected ${columnCount}`,
            )
        }
        return cells
    })

    return { headers, rows }
}

export function stringify(dataset: Dataset): string {
    if (dataset.headers.length === 0 && dataset.rows.length === 0) {
        return ''
    }

    const lines = [
        dataset.headers.join(','),
        ...dataset.rows.map((row) => row.join(',')),
    ]
    return lines.join('\n')
}
