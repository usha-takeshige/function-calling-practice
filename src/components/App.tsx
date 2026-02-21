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
        sortOrder,
    } = useTableData()

    // 元のヘッダー全列を保持
    const [allHeaders, setAllHeaders] = useState<string[]>([])
    const [fileName, setFileName] = useState<string>('export.csv')
    const [error, setError] = useState<string | null>(null)

    const isLoaded = allHeaders.length > 0

    async function handleFileSelect(file: File) {
        try {
            setError(null)
            const text = await readTextFromFile(file)
            const dataset = parse(text)
            setAllHeaders(dataset.headers)
            setFileName(file.name)
            loadData(dataset)
        } catch (e) {
            if (e instanceof Error) {
                setError(e.message)
            } else {
                setError('Unknown error occurred')
            }
        }
    }

    function handleExport() {
        const csvContent = stringify(processedDataset)
        downloadCSV(csvContent, fileName)
    }

    // 各列の表示状態を processedDataset.headers から導出
    const columns: ColumnConfig[] = allHeaders.map((h) => ({
        name: h,
        isVisible: processedDataset.headers.includes(h),
    }))

    return (
        <div>
            {error && <p role="alert">{error}</p>}
            <FileUpload onFileSelect={handleFileSelect} />
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
                        sortOrder={sortOrder}
                        onHeaderClick={toggleSort}
                    />
                </>
            )}
        </div>
    )
}
