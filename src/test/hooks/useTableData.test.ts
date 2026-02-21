import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useTableData } from '../../hooks/useTableData'
import type { Dataset } from '../../types'

const sampleDataset: Dataset = {
    headers: ['name', 'age', 'city'],
    rows: [
        ['Alice', '30', 'Tokyo'],
        ['Bob', '25', 'Osaka'],
        ['Charlie', '35', 'Nagoya'],
    ],
}

describe('useTableData', () => {
    describe('loadData()', () => {
        it('データを初期化し、全列をvisibleColumnsに追加する', () => {
            const { result } = renderHook(() => useTableData())

            act(() => {
                result.current.loadData(sampleDataset)
            })

            expect(result.current.processedDataset.headers).toEqual([
                'name',
                'age',
                'city',
            ])
            expect(result.current.processedDataset.rows).toHaveLength(3)
        })
    })

    describe('setFilter()', () => {
        it('filterTextが更新され、processedDatasetが再計算される', () => {
            const { result } = renderHook(() => useTableData())

            act(() => {
                result.current.loadData(sampleDataset)
            })
            act(() => {
                result.current.setFilter('alice')
            })

            expect(result.current.processedDataset.rows).toHaveLength(1)
            expect(result.current.processedDataset.rows[0][0]).toBe('Alice')
        })
    })

    describe('toggleSort()', () => {
        it('未ソートの列を指定すると昇順になる', () => {
            const { result } = renderHook(() => useTableData())

            act(() => {
                result.current.loadData(sampleDataset)
            })
            act(() => {
                result.current.toggleSort('name')
            })

            const rows = result.current.processedDataset.rows
            expect(rows[0][0]).toBe('Alice')
            expect(rows[1][0]).toBe('Bob')
            expect(rows[2][0]).toBe('Charlie')
        })

        it('昇順の列を再度指定すると降順になる', () => {
            const { result } = renderHook(() => useTableData())

            act(() => {
                result.current.loadData(sampleDataset)
            })
            act(() => {
                result.current.toggleSort('name')
            })
            act(() => {
                result.current.toggleSort('name')
            })

            const rows = result.current.processedDataset.rows
            expect(rows[0][0]).toBe('Charlie')
            expect(rows[2][0]).toBe('Alice')
        })

        it('降順の列を再度指定すると昇順に戻る（2状態トグル）', () => {
            const { result } = renderHook(() => useTableData())

            act(() => {
                result.current.loadData(sampleDataset)
            })
            act(() => {
                result.current.toggleSort('name')
            })
            act(() => {
                result.current.toggleSort('name')
            })
            act(() => {
                result.current.toggleSort('name')
            })

            const rows = result.current.processedDataset.rows
            expect(rows[0][0]).toBe('Alice')
        })
    })

    describe('toggleColumnVisibility()', () => {
        it('指定した列の表示/非表示が反転する', () => {
            const { result } = renderHook(() => useTableData())

            act(() => {
                result.current.loadData(sampleDataset)
            })
            act(() => {
                result.current.toggleColumnVisibility('age')
            })

            expect(result.current.processedDataset.headers).not.toContain('age')
            expect(result.current.processedDataset.headers).toContain('name')
            expect(result.current.processedDataset.headers).toContain('city')
        })
    })

    describe('isExportDisabled', () => {
        it('初期状態（データなし）ではtrueになる', () => {
            const { result } = renderHook(() => useTableData())
            expect(result.current.isExportDisabled).toBe(true)
        })

        it('データが存在する場合はfalseになる', () => {
            const { result } = renderHook(() => useTableData())

            act(() => {
                result.current.loadData(sampleDataset)
            })

            expect(result.current.isExportDisabled).toBe(false)
        })

        it('フィルタリングで0行になった場合はtrueになる', () => {
            const { result } = renderHook(() => useTableData())

            act(() => {
                result.current.loadData(sampleDataset)
            })
            act(() => {
                result.current.setFilter('ZZZNOMATCH')
            })

            expect(result.current.isExportDisabled).toBe(true)
        })
    })

    describe('processedDataset の加工順序', () => {
        it('列フィルタ → 行フィルタ → ソート の順で適用される', () => {
            const { result } = renderHook(() => useTableData())

            act(() => {
                result.current.loadData(sampleDataset)
            })
            // ageを非表示にする
            act(() => {
                result.current.toggleColumnVisibility('age')
            })
            // 'o'を含む行でフィルタ（Alice:Tokyo, Bob:Osaka）
            act(() => {
                result.current.setFilter('o')
            })
            // nameで昇順ソート
            act(() => {
                result.current.toggleSort('name')
            })

            const { headers, rows } = result.current.processedDataset
            // headerにageが含まれないこと
            expect(headers).not.toContain('age')
            // 行が絞り込まれ、ソートされていること
            expect(rows[0][0]).toBe('Alice')
            expect(rows[1][0]).toBe('Bob')
        })
    })
})
