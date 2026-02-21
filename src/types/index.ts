// CSVデータ本体
export interface Dataset {
    headers: string[]
    rows: string[][]
}

// ソート状態
export type SortOrder = {
    column: string
    direction: 'asc' | 'desc'
} | null

// 列の表示設定
export interface ColumnConfig {
    name: string
    isVisible: boolean
}
