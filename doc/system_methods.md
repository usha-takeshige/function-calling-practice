# システム設計 (React Architecture)

`doc/features.md` の機能要件を実現するための、Reactアプリケーション設計を定義します。
ロジック（Utility）、副作用（Infrastructure）、状態管理（Hooks）、UI（Components）を分離し、テスト駆動開発(TDD)に適した構成とします。

## 1. データ構造定義 (Type Definitions)

TypeScriptのインターフェースとしても利用可能なデータ形式定義。

- **Dataset**: `{ headers: string[], rows: string[][] }`
  - CSVデータそのもの。
- **SortOrder**: `{ column: string, direction: 'asc' | 'desc' } | null`
  - ソート状態。
- **ColumnConfig**: `{ name: string, isVisible: boolean }`
  - 列の表示設定。

---

## 2. ユーティリティ (Logic Layer)

純粋な関数群。副作用を持たず、入力に対して常に出力が一意に定まるため、最もテストしやすい層です。

### 2.1 CSVParser
- `parse(csvString: string): Dataset`
  - **正常系**: カンマ区切りの文字列を `Dataset` オブジェクトに変換する。
  - **異常系**:
    - 空文字列の場合: `{ headers: [], rows: [] }` を返す（エラーとせず空データとして扱う）。
    - 列数が不揃いの場合: `ParseError` をスローする。行によって列数が異なる不正なCSVは許容しない。
- `stringify(dataset: Dataset): string`
  - **正常系**: `Dataset` オブジェクトをCSV形式の文字列に変換する。ヘッダー行を含める。
  - **異常系**: `dataset` が空（headersもrowsもない）場合、空文字列を返す。

### 2.2 DataProcessor
- `filterRows(rows: string[][], keyword: string): string[][]`
  - **仕様**: `keyword` が空の場合は全行を返す。指定された場合は、行内のいずれかのセルに文字列として `keyword` を含む行のみを返す（部分一致）。大文字小文字は区別しない。
- `sortRows(rows: string[][], columnIndex: number, order: 'asc' | 'desc'): string[][]`
  - **仕様**: 指定列の値を基準に行を並び替える。数値として解釈可能な場合は数値順、それ以外は辞書順とする。
- `filterColumns(headers: string[], rows: string[][], visibleColumns: string[]): Dataset`
  - **仕様**: `visibleColumns` に含まれる列名のみを抽出した新しい `Dataset` を生成する。エクスポート時や表示用データの生成に使用。

---

## 3. サービス/インフラ (Infrastructure Layer)

外部リソース（ファイルシステム、ブラウザAPI）とのやり取りを行う層。非同期処理や副作用を含みます。
テスト時はこの層をモック（Mock）することで、UIやロジックのテストを簡易化します。

### 3.1 FileIO
- `readTextFromFile(file: File): Promise<string>`
  - **仕様**: ブラウザの `FileReader` APIを使用し、ファイルをテキストとして読み込む。
  - **異常系**: 読み込みエラー時は `FileReadError` を reject する。
- `downloadCSV(csvContent: string, filename: string): void`
  - **仕様**: Blobを作成し、アンカータグを生成・クリックすることでブラウザにダウンロードを指示する。
  - **異常系**: `csvContent` が空の場合は何も実行しない（または警告ログを出力）。

---

## 4. アプリケーションロジック (Hooks Layer)

Reactの状態管理とロジックを繋ぐ層。UIコンポーネントからロジックを分離するためのカスタムフックです。
`renderHook` を使用したユニットテストを行います。

### 4.1 useTableData
テーブルデータの状態遷移（フィルタ、ソート、列表示切替）を一元管理するフック。

- **State**:
  - `rawDataset`: `Dataset | null` (アップロードされた元データ)
  - `filterText`: `string` (検索キーワード)
  - `sortOrder`: `SortOrder` (ソート設定)
  - `visibleColumns`: `Set<string>` (表示列の集合)

- **Derived State (memoized)**:
  - `processedDataset`: `Dataset`
    - `rawDataset` に対し、列フィルタ -> 行フィルタ -> ソート の順で加工を適用した結果。画面表示の実体。

- **Actions (Methods)**:
  - `loadData(dataset: Dataset)`: データを初期化し、全列を表示状態にする。
  - `setFilter(text: string)`: `filterText` を更新する。
  - `toggleSort(columnName: string)`:
    - 指定列が現在のソート対象でなければ「昇順」に設定。
    - 現在「昇順」なら「降順」に切り替え。
    - 現在「降順」ならソート解除（null）にする。
  - `toggleColumnVisibility(columnName: string)`: 指定列の表示/非表示を反転させる。少なくとも1列は表示状態を維持する（全非表示は防ぐ等のガードロジックを入れるか検討）。

---

## 5. React コンポーネント構成 (UI Layer)

Propsを受け取り表示するだけの「Presentational Component」を推奨。ロジックはHooksに委譲します。

- **App (Main Container)**
  - `useTableData` フックを使用。
  - `FileIO.readTextFromFile` を呼び出し、結果を `loadData` に渡すフロー制御を行う。

- **Components**
  - `FileUpload`: ファイル選択UI。`onFileSelect(file: File)` をPropsとして受け取る。
  - `ControlPanel`: フィルタ入力、列選択メニュー、エクスポートボタンの親コンポーネント。
  - `DataTable`: `processedDataset` と `sortOrder` を受け取り描画。ヘッダークリック時に `onHeaderClick` を呼ぶ。
