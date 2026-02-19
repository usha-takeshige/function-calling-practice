import type { ColumnConfig } from '../types'

interface ControlPanelProps {
    columns: ColumnConfig[]
    isExportDisabled: boolean
    onToggleColumn: (columnName: string) => void
    onFilterChange: (text: string) => void
    onExport: () => void
}

export function ControlPanel(_props: ControlPanelProps) {
    return <div>ControlPanel stub</div>
}
