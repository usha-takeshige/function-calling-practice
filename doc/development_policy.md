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
- [ ] 正常なCSV文字列を`Dataset`に変換できる
- [ ] 空文字列を受け取った場合、`{ headers: [], rows: [] }`を返す
- [ ] 列数が不揃いのCSVで`ParseError`をスローする
- [ ] `Dataset`をCSV文字列に変換できる（ヘッダー行を含む）
- [ ] 空の`Dataset`を受け取った場合、空文字列を返す

#### DataProcessor
- [ ] `filterRows`: キーワードが空の場合、全行を返す
- [ ] `filterRows`: 部分一致で行を絞り込める（大文字小文字を区別しない）
- [ ] `sortRows`: 数値として解釈できる列を数値順でソートできる
- [ ] `sortRows`: 文字列列を辞書順でソートできる（昇順/降順）
- [ ] `filterColumns`: 指定した列名のみを含む`Dataset`を返す

#### useTableData フック
- [ ] `loadData`でデータが初期化され、全列が`visibleColumns`に追加される
- [ ] `setFilter`で`filterText`が更新され、`processedDataset`が再計算される
- [ ] `toggleSort`: 未ソート列→昇順、昇順→降順、降順→昇順 の順で切り替わる
- [ ] `toggleColumnVisibility`で列の表示/非表示が反転する
- [ ] `processedDataset`は「列フィルタ → 行フィルタ → ソート」の順で適用される
- [ ] データが0件のとき`isExportDisabled`が`true`になる

#### FileIO
- [ ] `readTextFromFile`: ファイルを正常に読み込めた場合、テキストを返す
- [ ] `readTextFromFile`: 読み込みエラー時に`FileReadError`でrejectされる
- [ ] `downloadCSV`: `Blob`とアンカータグによるダウンロードが発火する

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
- **コミット粒度**: Red → Green → Refactor の1サイクルを1コミットの目安とする。
- **コミットメッセージ**: 英語で記述する。
- **イシュー番号の付与**: コミットメッセージには、イシュー番号を付ける。
- **PRの作成**: PRの作成時は、イシュー番号を付ける。
- **GitHubとのやり取り**: ghコマンドを用いる。
