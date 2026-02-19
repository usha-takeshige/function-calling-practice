import type { Dataset } from '../types'

export function filterRows(rows: string[][], keyword: string): string[][] {
    if (keyword === '') {
        return rows
    }
    const lower = keyword.toLowerCase()
    return rows.filter((row) =>
        row.some((cell) => cell.toLowerCase().includes(lower)),
    )
}

export function sortRows(
    rows: string[][],
    columnIndex: number,
    order: 'asc' | 'desc',
): string[][] {
    const sorted = [...rows].sort((a, b) => {
        const aVal = a[columnIndex]
        const bVal = b[columnIndex]

        const aNum = Number(aVal)
        const bNum = Number(bVal)

        const isNumeric = !isNaN(aNum) && !isNaN(bNum)

        if (isNumeric) {
            return order === 'asc' ? aNum - bNum : bNum - aNum
        }

        return order === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal)
    })
    return sorted
}

export function filterColumns(
    headers: string[],
    rows: string[][],
    visibleColumns: string[],
): Dataset {
    const indices = visibleColumns.map((col) => headers.indexOf(col))
    const filteredHeaders = indices.map((i) => headers[i])
    const filteredRows = rows.map((row) => indices.map((i) => row[i]))
    return { headers: filteredHeaders, rows: filteredRows }
}
