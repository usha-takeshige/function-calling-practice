import { useState } from 'react'
import { useTableData } from '../hooks/useTableData'
import { readTextFromFile } from '../infrastructure/fileIO'
import { parse, stringify } from '../logic/csvParser'
import { downloadCSV } from '../infrastructure/fileIO'
import { FileUpload } from './FileUpload'
import { ControlPanel } from './ControlPanel'
import { DataTable } from './DataTable'
import type { ColumnConfig } from '../types'

export function App() {
    const {
        processedDataset,
        isExportDisabled,
        loadData,
        setFilter,
        toggleSort,
        toggleColumnVisibility,
    } = useTableData()

    // 元のヘッダー全列を保持（非表示列もチェックボックスに表示するため）
    const [allHeaders, setAllHeaders] = useState<string[]>([])

    const isLoaded = allHeaders.length > 0

    async function handleFileSelect(file: File) {
        const text = await readTextFromFile(file)
        const dataset = parse(text)
        setAllHeaders(dataset.headers)
        loadData(dataset)
    }

    function handleExport() {
        const csvContent = stringify(processedDataset)
        downloadCSV(csvContent, 'export.csv')
    }

    // 各列の表示状態を processedDataset.headers から導出
    const columns: ColumnConfig[] = allHeaders.map((h) => ({
        name: h,
        isVisible: processedDataset.headers.includes(h),
    }))

    return (
        <div>
            {!isLoaded && (
                <FileUpload onFileSelect={handleFileSelect} />
            )}
            {isLoaded && (
                <>
                    <ControlPanel
                        columns={columns}
                        isExportDisabled={isExportDisabled}
                        onToggleColumn={toggleColumnVisibility}
                        onFilterChange={setFilter}
                        onExport={handleExport}
                    />
                    <DataTable
                        dataset={processedDataset}
                        sortOrder={null}
                        onHeaderClick={toggleSort}
                    />
                </>
            )}
        </div>
    )
}
