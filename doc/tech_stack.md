# 機能別 必要技術一覧

`doc/features.md` および `doc/system_methods.md` に基づき、各機能に必要な技術をまとめます。

---

## UC-1: CSVファイルのアップロード

| 機能                 | 技術・API                                                           |
| -------------------- | ------------------------------------------------------------------- |
| ドラッグ＆ドロップUI | HTML Drag and Drop API（`dragover`, `drop` イベント）               |
| ファイル読み込み     | `FileReader` API（`readAsText()`）/ `FileIO.readTextFromFile()`     |
| CSVパース            | `CSVParser.parse()` — 純粋関数（ロジック層）                        |
| エラーハンドリング   | `FileReadError` / `ParseError` のカスタムエラー、Reactの状態管理    |
| 画面遷移             | React の条件分岐レンダリング（`rawDataset` が `null` か否かで切替） |

---

## UC-2: 表示列の選択

| 機能                     | 技術・API                                                              |
| ------------------------ | ---------------------------------------------------------------------- |
| チェックボックスUI       | React コンポーネント（`ControlPanel`）                                 |
| 列の表示状態管理         | `useTableData` カスタムフック（`visibleColumns: Set<string>`）         |
| 列フィルタリングロジック | `DataProcessor.filterColumns()` — 純粋関数                             |
| 即時更新                 | React の `useMemo`（`processedDataset` を derived state として再計算） |

---

## UC-3: データのソート

| 機能               | 技術・API                                                                            |
| ------------------ | ------------------------------------------------------------------------------------ |
| ヘッダークリックUI | React コンポーネント（`DataTable` の `onHeaderClick` Prop）                          |
| ソート状態管理     | `useTableData` フック（`sortOrder: SortOrder`）、`toggleSort()` アクション           |
| ソートロジック     | `DataProcessor.sortRows()` — 数値/辞書順の判定を含む純粋関数                         |
| ソート状態の視覚化 | 矢印アイコン（CSS + 条件付きレンダリング）、TypeScript の union 型 `'asc' \| 'desc'` |

---

## UC-4: データのフィルタリング

| 機能                   | 技術・API                                                                         |
| ---------------------- | --------------------------------------------------------------------------------- |
| 検索入力UI             | React コンポーネント（`ControlPanel` 内の `<input>`）                             |
| フィルタ状態管理       | `useTableData` フック（`filterText: string`）、`setFilter()` アクション           |
| フィルタリングロジック | `DataProcessor.filterRows()` — 大文字小文字を区別しない部分一致、純粋関数         |
| リアルタイム更新       | React の `useMemo`（`filterText` の変化をトリガーに `processedDataset` を再計算） |

---

## UC-5: 加工済みデータのエクスポート

| 機能                 | 技術・API                                                                                  |
| -------------------- | ------------------------------------------------------------------------------------------ |
| エクスポートボタンUI | React コンポーネント（`ControlPanel`）、`disabled` 属性制御                                |
| ボタンの活性/非活性  | `useTableData` フック（`isExportDisabled: boolean`）                                       |
| CSV文字列生成        | `CSVParser.stringify()` — 純粋関数                                                         |
| ファイルダウンロード | `FileIO.downloadCSV()` — `Blob` + 動的アンカータグ（`URL.createObjectURL`, `<a>.click()`） |

---

## 横断的な技術スタック

| 領域             | 技術                                                                              |
| ---------------- | --------------------------------------------------------------------------------- |
| UIフレームワーク | **React**                                                                         |
| 型システム       | **TypeScript**（`Dataset`, `SortOrder`, `ColumnConfig` 等のインターフェース定義） |
| 状態管理         | React 組み込み（`useState`, `useMemo`, カスタムフック）                           |
| テスト           | TDD想定 — `renderHook`（フックのユニットテスト）、モック（`FileIO` 層をモック化） |
| ブラウザAPI      | `FileReader`, `Blob`, `URL.createObjectURL`, Drag & Drop API                      |
