# システム設計 (React Architecture)

`doc/features.md` の機能要件を実現するための、Reactアプリケーション設計を定義します。ロジック（Utility）とUI（Components）を分離し、保守性を高めます。

## 1. データ構造定義 (Type Definitions)

TypeScriptのインターフェースとしても利用可能なデータ形式定義。

- **Dataset**: `{ headers: string[], rows: string[][] }`
  - CSVデータそのもの。
- **Config**: `{ sort: SortOrder, filter: string, visibleColumns: string[] }`
  - ユーザーの操作状態。
- **SortOrder**: `{ column: string, direction: 'asc' | 'desc' } | null`

---

## 2. ユーティリティ (Logic Layer)

Reactに依存しない純粋な関数群。`src/utils/` などに配置します。

### 2.1 CSVParser
- `parse(csvString: string): Dataset`
  - テキストをオブジェクトに変換。
- `stringify(dataset: Dataset): string`
  - オブジェクトをCSVテキストに変換。

### 2.2 DataProcessor
- `filterRows(rows: string[][], keyword: string): string[][]`
  - 行データの絞り込み。
- `sortRows(rows: string[][], columnIndex: number, order: 'asc' | 'desc'): string[][]`
  - 行データのソート。
- `filterColumns(headers: string[], rows: string[][], targetColumns: string[]): Dataset`
  - 表示列のみを抽出した新しいデータセットの生成（エクスポート用）。

---

## 3. React コンポーネント構成 (UI Layer)

### 3.1 コンポーネント階層

- **App (Main Container)**
  - 全体の状態管理 (`dataset`, `config`) を行う。
  - **FileUpload**: ファイル入力エリア（初期表示）。
  - **Dashboard**: データ読み込み後のメイン画面。
    - **ControlPanel**: 操作メニュー。
      - `ColumnSelector`: 列の表示切替。
      - `SearchInput`: フィルタ入力。
      - `ExportButton`: CSVダウンロードボタン。
    - **DataTable**: データ表示テーブル。
      - ソートヘッダーのクリックイベントなどを処理。

### 3.2 状態管理 (State Management)

`App` またはカスタムフック (`useCSVData`) で管理する主要なState。

| State名            | 型                | 説明                                                                                                              |
| :----------------- | :---------------- | :---------------------------------------------------------------------------------------------------------------- |
| `rawDataset`       | `Dataset \| null` | アップロードされたオリジナルの全データ。                                                                          |
| `filterText`       | `string`          | 検索ボックスの入力値。                                                                                            |
| `sortOrder`        | `SortOrder`       | 現在のソート設定。                                                                                                |
| `visibleColumns`   | `Set<string>`     | 現在表示中の列名の集合。                                                                                          |
| `processedDataset` | `Dataset`         | **Derived State (派生状態)**。`rawDataset` に対してフィルタ・ソート・列選択を適用した結果。`useMemo` で計算する。 |

### 3.3 インタラクション (Event flow)

1. **Upload**: `FileUpload` でファイルを受け取り、`parse` して `rawDataset` にセット。
2. **Filter**: `SearchInput` の変更を `filterText` に反映。`processedDataset` が自動再計算される。
3. **Sort**: `DataTable` ヘッダーのクリックで `sortOrder` を更新。`processedDataset` が自動再計算される。
4. **Export**: `ExportButton` クリック時、`processedDataset` を `stringify` してダウンロードさせる。
