import type { ColumnConfig } from '../types'

interface ControlPanelProps {
    columns: ColumnConfig[]
    isExportDisabled: boolean
    onToggleColumn: (columnName: string) => void
    onFilterChange: (text: string) => void
    onExport: () => void
}

export function ControlPanel({
    columns,
    isExportDisabled,
    onToggleColumn,
    onFilterChange,
    onExport,
}: ControlPanelProps) {
    return (
        <div>
            {/* 列選択チェックボックス */}
            <div>
                {columns.map((col) => (
                    <label key={col.name}>
                        <input
                            type="checkbox"
                            checked={col.isVisible}
                            onChange={() => onToggleColumn(col.name)}
                        />
                        {col.name}
                    </label>
                ))}
            </div>

            {/* フィルタ入力 */}
            <input
                type="search"
                placeholder="検索…"
                onChange={(e) => onFilterChange(e.target.value)}
            />

            {/* エクスポートボタン */}
            <button onClick={onExport} disabled={isExportDisabled}>
                Export
            </button>
        </div>
    )
}
