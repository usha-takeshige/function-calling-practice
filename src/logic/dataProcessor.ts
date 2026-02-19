import type { Dataset } from '../types'

export function filterRows(_rows: string[][], _keyword: string): string[][] {
    throw new Error('Not implemented')
}

export function sortRows(
    _rows: string[][],
    _columnIndex: number,
    _order: 'asc' | 'desc',
): string[][] {
    throw new Error('Not implemented')
}

export function filterColumns(
    _headers: string[],
    _rows: string[][],
    _visibleColumns: string[],
): Dataset {
    throw new Error('Not implemented')
}
