import type { Dataset, SortOrder } from '../types'

interface DataTableProps {
    dataset: Dataset
    sortOrder: SortOrder
    onHeaderClick: (columnName: string) => void
}

export function DataTable(_props: DataTableProps) {
    return <div>DataTable stub</div>
}
