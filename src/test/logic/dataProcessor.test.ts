import { describe, it, expect } from 'vitest'
import {
    filterRows,
    sortRows,
    filterColumns,
} from '../../logic/dataProcessor'
import type { Dataset } from '../../types'

describe('DataProcessor', () => {
    describe('filterRows()', () => {
        const rows = [
            ['Alice', '30', 'Tokyo'],
            ['Bob', '25', 'Osaka'],
            ['Charlie', '35', 'tokyo'],
        ]

        it('キーワードが空の場合、全行を返す', () => {
            expect(filterRows(rows, '')).toEqual(rows)
        })

        it('部分一致で行を絞り込める（大文字小文字を区別しない）', () => {
            const result = filterRows(rows, 'alice')
            expect(result).toEqual([['Alice', '30', 'Tokyo']])
        })

        it('複数行が一致する場合、全て返す（大文字小文字を区別しない）', () => {
            const result = filterRows(rows, 'tokyo')
            expect(result).toEqual([
                ['Alice', '30', 'Tokyo'],
                ['Charlie', '35', 'tokyo'],
            ])
        })

        it('一致する行がない場合、空配列を返す', () => {
            expect(filterRows(rows, 'Nonexistent')).toEqual([])
        })
    })

    describe('sortRows()', () => {
        const rows = [
            ['Bob', '25'],
            ['Alice', '30'],
            ['Charlie', '5'],
        ]

        it('文字列列を辞書順（昇順）でソートできる', () => {
            const result = sortRows(rows, 0, 'asc')
            expect(result).toEqual([
                ['Alice', '30'],
                ['Bob', '25'],
                ['Charlie', '5'],
            ])
        })

        it('文字列列を辞書順（降順）でソートできる', () => {
            const result = sortRows(rows, 0, 'desc')
            expect(result).toEqual([
                ['Charlie', '5'],
                ['Bob', '25'],
                ['Alice', '30'],
            ])
        })

        it('数値として解釈できる列を数値順（昇順）でソートできる', () => {
            const result = sortRows(rows, 1, 'asc')
            expect(result).toEqual([
                ['Charlie', '5'],
                ['Bob', '25'],
                ['Alice', '30'],
            ])
        })

        it('数値として解釈できる列を数値順（降順）でソートできる', () => {
            const result = sortRows(rows, 1, 'desc')
            expect(result).toEqual([
                ['Alice', '30'],
                ['Bob', '25'],
                ['Charlie', '5'],
            ])
        })
    })

    describe('filterColumns()', () => {
        const headers = ['name', 'age', 'city']
        const rows = [
            ['Alice', '30', 'Tokyo'],
            ['Bob', '25', 'Osaka'],
        ]

        it('指定した列名のみを含むDatasetを返す', () => {
            const result = filterColumns(headers, rows, ['name', 'city'])
            expect(result).toEqual<Dataset>({
                headers: ['name', 'city'],
                rows: [
                    ['Alice', 'Tokyo'],
                    ['Bob', 'Osaka'],
                ],
            })
        })

        it('全列を指定した場合、元のDatasetと同じ内容を返す', () => {
            const result = filterColumns(headers, rows, ['name', 'age', 'city'])
            expect(result).toEqual<Dataset>({ headers, rows })
        })

        it('空のvisibleColumnsを指定した場合、空のDatasetを返す', () => {
            const result = filterColumns(headers, rows, [])
            expect(result).toEqual<Dataset>({ headers: [], rows: [[], []] })
        })
    })
})
