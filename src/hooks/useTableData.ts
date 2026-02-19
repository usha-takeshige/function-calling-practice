import { useState, useMemo } from 'react'
import type { Dataset, SortOrder } from '../types'
import { filterRows, sortRows, filterColumns } from '../logic/dataProcessor'

interface UseTableDataReturn {
    processedDataset: Dataset
    isExportDisabled: boolean
    loadData: (dataset: Dataset) => void
    setFilter: (text: string) => void
    toggleSort: (columnName: string) => void
    toggleColumnVisibility: (columnName: string) => void
}

export function useTableData(): UseTableDataReturn {
    const [rawDataset, setRawDataset] = useState<Dataset | null>(null)
    const [filterText, setFilterText] = useState<string>('')
    const [sortOrder, setSortOrder] = useState<SortOrder>(null)
    const [visibleColumns, setVisibleColumns] = useState<Set<string>>(new Set())

    const processedDataset = useMemo<Dataset>(() => {
        if (rawDataset === null) {
            return { headers: [], rows: [] }
        }

        // Step 1: 列フィルタ
        const visibleColumnArray = rawDataset.headers.filter((h) =>
            visibleColumns.has(h),
        )
        const colFiltered = filterColumns(
            rawDataset.headers,
            rawDataset.rows,
            visibleColumnArray,
        )

        // Step 2: 行フィルタ
        const rowFiltered = filterRows(colFiltered.rows, filterText)

        // Step 3: ソート
        let sorted = rowFiltered
        if (sortOrder !== null) {
            const colIndex = colFiltered.headers.indexOf(sortOrder.column)
            if (colIndex >= 0) {
                sorted = sortRows(rowFiltered, colIndex, sortOrder.direction)
            }
        }

        return { headers: colFiltered.headers, rows: sorted }
    }, [rawDataset, filterText, sortOrder, visibleColumns])

    const isExportDisabled = processedDataset.rows.length === 0

    function loadData(dataset: Dataset): void {
        setRawDataset(dataset)
        setFilterText('')
        setSortOrder(null)
        setVisibleColumns(new Set(dataset.headers))
    }

    function setFilter(text: string): void {
        setFilterText(text)
    }

    function toggleSort(columnName: string): void {
        setSortOrder((prev) => {
            if (prev === null || prev.column !== columnName) {
                return { column: columnName, direction: 'asc' }
            }
            if (prev.direction === 'asc') {
                return { column: columnName, direction: 'desc' }
            }
            // desc → asc（2状態トグル）
            return { column: columnName, direction: 'asc' }
        })
    }

    function toggleColumnVisibility(columnName: string): void {
        setVisibleColumns((prev) => {
            const next = new Set(prev)
            if (next.has(columnName)) {
                next.delete(columnName)
            } else {
                next.add(columnName)
            }
            return next
        })
    }

    return {
        processedDataset,
        isExportDisabled,
        loadData,
        setFilter,
        toggleSort,
        toggleColumnVisibility,
    }
}
