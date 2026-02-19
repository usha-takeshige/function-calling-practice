import type { Dataset, SortOrder } from '../types'

interface UseTableDataReturn {
    processedDataset: Dataset
    isExportDisabled: boolean
    loadData: (dataset: Dataset) => void
    setFilter: (text: string) => void
    toggleSort: (columnName: string) => void
    toggleColumnVisibility: (columnName: string) => void
}

export function useTableData(): UseTableDataReturn {
    throw new Error('Not implemented')
}

// SortOrderはフックの戻り値型には含まれないが、内部で使用するため型パスを通す
export type { SortOrder }
