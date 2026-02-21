# 開発方針書

`doc/use_cases.md`, `doc/features.md`, `doc/system_methods.md`, `doc/tech_stack.md` に基づく、テスト駆動開発 (TDD) を中心とした開発方針を定義します。

---

## 1. 基本方針

### 1.1 開発スタイル：テスト駆動開発 (TDD)

本プロジェクトは **Red → Green → Refactor** のサイクルを基本とするTDDで進めます。

| フェーズ     | 内容                                       |
| ------------ | ------------------------------------------ |
| **Red**      | 失敗するテストコードを先に書く             |
| **Green**    | テストが通る最小限の実装を行う             |
| **Refactor** | テストを通したまま、コードの品質を改善する |

> コードを書く前にテストを書くことで、仕様の明確化と設計品質の向上を同時に実現します。

---

### 1.2 アーキテクチャ原則

`doc/system_methods.md` で定義された通り、アプリケーションを4つの層に分離します。
各層の責務を明確にすることで、テストの書きやすさと保守性を確保します。

```
Logic Layer      (CSVParser, DataProcessor)   ← 純粋関数。最もテストしやすい
Infrastructure Layer  (FileIO)                ← 副作用を担う。テスト時はモック化
Hooks Layer      (useTableData)               ← 状態管理。renderHookでテスト
UI Layer         (Components)                 ← Propsを受け取るだけのPresentational Component
```

---

## 2. 技術スタック

| 領域                 | 技術                                                         |
| -------------------- | ------------------------------------------------------------ |
| UIフレームワーク     | **React**                                                    |
| 型システム           | **TypeScript**                                               |
| 状態管理             | React組み込み (`useState`, `useMemo`, カスタムフック)        |
| テストフレームワーク | **Vitest** / **Jest** + `@testing-library/react`             |
| ブラウザAPI          | `FileReader`, `Blob`, `URL.createObjectURL`, Drag & Drop API |

---

## 3. テスト戦略

### 3.1 層別テスト方針

各層の特性に応じて、テスト手法を使い分けます。

#### Logic Layer（純粋関数）
- **対象**: `CSVParser.parse()`, `CSVParser.stringify()`, `DataProcessor.filterRows()`, `DataProcessor.sortRows()`, `DataProcessor.filterColumns()`
- **手法**: ユニットテスト。副作用がないため、入力と出力の検証のみ。
- **優先度**: ★★★（最高）。全機能の中核であるため最初に実装・テストする。

#### Infrastructure Layer（副作用・ブラウザAPI）
- **対象**: `FileIO.readTextFromFile()`, `FileIO.downloadCSV()`
- **手法**: `FileReader`や`Blob`をモック化してテストする。
- **優先度**: ★★（中）。Logic Layerの実装後にテストを作成する。

#### Hooks Layer（状態管理）
- **対象**: `useTableData`フック
- **手法**: `renderHook`を使ったユニットテスト。`FileIO`はモック化する。
- **優先度**: ★★★（高）。状態遷移のロジックを網羅的にテストする。

#### UI Layer（コンポーネント）
- **対象**: `FileUpload`, `ControlPanel`, `DataTable`, `App`
- **手法**: `@testing-library/react`を使った統合的なレンダリングテスト。ユーザー操作をシミュレートして振る舞いを検証する。
- **優先度**: ★（低）。ロジック層が固まった後に実施する。

---

### 3.2 テストケース チェックリスト

#### CSVParser
- [x] 正常なCSV文字列を`Dataset`に変換できる
- [x] 空文字列を受け取った場合、`{ headers: [], rows: [] }`を返す
- [x] 列数が不揃いのCSVで`ParseError`をスローする
- [x] `Dataset`をCSV文字列に変換できる（ヘッダー行を含む）
- [x] 空の`Dataset`を受け取った場合、空文字列を返す

#### DataProcessor
- [x] `filterRows`: キーワードが空の場合、全行を返す
- [x] `filterRows`: 部分一致で行を絞り込める（大文字小文字を区別しない）
- [x] `filterRows`: 複数行が一致する場合、全て返す（大文字小文字を区別しない）
- [x] `filterRows`: 一致する行がない場合、空配列を返す
- [x] `sortRows`: 文字列列を辞書順（昇順）でソートできる
- [x] `sortRows`: 文字列列を辞書順（降順）でソートできる
- [x] `sortRows`: 数値として解釈できる列を数値順（昇順）でソートできる
- [x] `sortRows`: 数値として解釈できる列を数値順（降順）でソートできる
- [x] `filterColumns`: 指定した列名のみを含む`Dataset`を返す
- [x] `filterColumns`: 全列を指定した場合、元の`Dataset`と同じ内容を返す
- [x] `filterColumns`: 空の`visibleColumns`を指定した場合、空の`Dataset`を返す

#### useTableData フック
- [x] `loadData`でデータが初期化され、全列が`visibleColumns`に追加される
- [x] `setFilter`で`filterText`が更新され、`processedDataset`が再計算される
- [x] `toggleSort`: 未ソート列を指定すると昇順になる
- [x] `toggleSort`: 昇順の列を再度指定すると降順になる
- [x] `toggleSort`: 降順の列を再度指定すると昇順に戻る（2状態トグル）
- [x] `toggleColumnVisibility`で列の表示/非表示が反転する
- [x] `processedDataset`は「列フィルタ → 行フィルタ → ソート」の順で適用される
- [x] 初期状態（データなし）では`isExportDisabled`が`true`になる
- [x] データが存在する場合は`isExportDisabled`が`false`になる
- [x] フィルタリングで0行になった場合は`isExportDisabled`が`true`になる

#### FileIO
- [x] `readTextFromFile`: ファイルを正常に読み込んだ場合、テキスト文字列を返す
- [x] `readTextFromFile`: 読み込みエラー時に`FileReadError`でrejectされる
- [x] `downloadCSV`: `Blob`とアンカータグによるダウンロードが発火する

#### FileUpload コンポーネント
- [x] ドラッグ＆ドロップエリアが描画される
- [x] CSV以外のファイルをドロップするとエラーメッセージが表示される
- [x] CSVファイルをドロップすると`onFileSelect`が呼ばれる
- [x] dragover イベントでドロップ受け入れ可能なビジュアルフィードバックが表示される
- [x] dragleave イベントでビジュアルフィードバックが解除される
- [x] エラー表示後に正しいCSVをドロップするとエラーメッセージが消える

#### ControlPanel コンポーネント
- [x] 列名のチェックボックスが全列分描画される
- [x] チェックボックスをOFFにすると`onToggleColumn`が呼ばれる
- [x] 検索ボックスに入力すると`onFilterChange`が呼ばれる
- [x] `isExportDisabled`が`true`のときエクスポートボタンが`disabled`になる
- [x] `isExportDisabled`が`false`のときエクスポートボタンをクリックすると`onExport`が呼ばれる
- [x] 「全列を表示」ボタンをクリックするとすべての列が表示される
- [x] 検索ボックスをクリアするとonFilterChangeが空文字列で呼ばれる
- [x] isVisibleがfalseの列のチェックボックスはOFF状態で描画される

#### DataTable コンポーネント
- [x] ヘッダー行とデータ行が正しく描画される
- [x] 列ヘッダーをクリックすると`onHeaderClick`が呼ばれる
- [x] 昇順ソート中の列ヘッダーに昇順アイコンが表示される
- [x] 降順ソート中の列ヘッダーに降順アイコンが表示される
- [x] データが空のとき行が描画されない
- [x] ソートされていない列ヘッダーにはaria-sort属性がない
- [x] Enterキーで列ヘッダーをクリックするとonHeaderClickが呼ばれる
- [x] 行数が多い場合に件数を表示するフッターが描画される

#### App（統合テスト）
- [x] 初期表示ではドラッグ＆ドロップエリアのみが表示される
- [x] CSVファイルをドロップするとデータテーブルが表示される
- [x] フィルタ入力後にテーブルの表示行が絞り込まれる
- [x] 列チェックボックスをOFFにすると該当列がテーブルから消える
- [x] エクスポートボタンクリックで`downloadCSV`が呼ばれる
- [x] 列ヘッダークリックで昇順ソートされる
- [x] 再クリックで降順ソートに切り替わる
- [x] 不正なCSVファイルをドロップするとエラーメッセージが表示される
- [x] エクスポート時のファイル名がアップロードしたファイルと同じになる
- [x] 別のCSVをドロップすると前のデータが上書きされる

---

## 4. 実装順序

TDDサイクルが回しやすいよう、依存関係が少ない層から着手します。

```
Phase 1: Logic Layer（純粋関数）
  → CSVParser のテスト & 実装
  → DataProcessor のテスト & 実装

Phase 2: Infrastructure Layer（副作用）
  → FileIO のテスト（モック）& 実装

Phase 3: Hooks Layer（状態管理）
  → useTableData のテスト（renderHook）& 実装

Phase 4: UI Layer（コンポーネント）
  → FileUpload, ControlPanel, DataTable のテスト & 実装
  → App（統合）のテスト & 実装
```

---

## 5. ディレクトリ構成（案）

```
src/
├── types/
│   └── index.ts              # Dataset, SortOrder, ColumnConfig の型定義
├── logic/
│   ├── csvParser.ts          # CSVParser
│   └── dataProcessor.ts      # DataProcessor
├── infrastructure/
│   └── fileIO.ts             # FileIO
├── hooks/
│   └── useTableData.ts       # useTableData カスタムフック
└── components/
    ├── App.tsx
    ├── FileUpload.tsx
    ├── ControlPanel.tsx
    └── DataTable.tsx

tests/
├── logic/
│   ├── csvParser.test.ts
│   └── dataProcessor.test.ts
├── infrastructure/
│   └── fileIO.test.ts
├── hooks/
│   └── useTableData.test.ts
└── components/
    ├── FileUpload.test.tsx
    ├── ControlPanel.test.tsx
    ├── DataTable.test.tsx
    └── App.test.tsx
```

---

## 6. コーディング規約

- **TypeScript**: 暗黙的な `any` の使用を禁止する (`strict: true`)。
- **関数設計**: Logic Layerは必ず純粋関数として実装し、副作用を持たせない。
- **エラー処理**: 想定内のエラーには`ParseError`, `FileReadError`等のカスタムエラークラスを使用する。
- **コミット粒度**: Red → Green → Refactor ごとにコミットする。
- **コミットメッセージ**: 英語で記述する。
- **イシュー番号の付与**: コミットメッセージには、イシュー番号を付ける。
- **PRの作成**: PRの作成時は、イシュー番号を付ける。
- **GitHubとのやり取り**: ghコマンドを用いる。
