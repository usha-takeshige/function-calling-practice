import type { Dataset, SortOrder } from '../types'

interface DataTableProps {
    dataset: Dataset
    sortOrder: SortOrder
    onHeaderClick: (columnName: string) => void
}

export function DataTable({ dataset, sortOrder, onHeaderClick }: DataTableProps) {
    function getAriaSort(
        column: string,
    ): 'ascending' | 'descending' | undefined {
        if (sortOrder?.column !== column) return undefined
        return sortOrder.direction === 'asc' ? 'ascending' : 'descending'
    }

    return (
        <table>
            <thead>
                <tr>
                    {dataset.headers.map((header) => (
                        <th
                            key={header}
                            onClick={() => onHeaderClick(header)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    onHeaderClick(header)
                                }
                            }}
                            aria-sort={getAriaSort(header)}
                            tabIndex={0}
                            style={{ cursor: 'pointer' }}
                        >
                            {header}
                            {sortOrder?.column === header && (
                                <span aria-hidden="true">
                                    {sortOrder.direction === 'asc' ? ' ↑' : ' ↓'}
                                </span>
                            )}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {dataset.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                            <td key={cellIndex}>{cell}</td>
                        ))}
                    </tr>
                ))}
            </tbody>
            <tfoot>
                <tr>
                    <td colSpan={dataset.headers.length} role="contentinfo">
                        {dataset.rows.length}
                    </td>
                </tr>
            </tfoot>
        </table>
    )
}
