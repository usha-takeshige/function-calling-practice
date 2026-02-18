# システムメソッド定義

`doc/features.md` の機能要件を実現するための、主要なシステムメソッド（関数・処理単位）を定義します。

## 1. データ構造定義 (Memo)

処理の中心となるデータ形式の定義です。

- **Dataset**: `header` (列名の配列) と `rows` (データ行の配列) を持つオブジェクト。
- **SortOrder**: `'asc'` (昇順) または `'desc'` (降順)。

---

## 2. モジュール別メソッド一覧

### 2.1 FileHandler (ファイル入出力)

ファイルの読み込みと保存を担当します。

#### `loadCSVFile(file)`
- **概要**: ユーザーがアップロードしたファイルを読み込み、テキストデータを取得する。
- **入力**: 
  - `file`: File オブジェクト (ブラウザのFile API由来)
- **出力**: 
  - `string`: CSV形式のテキストデータ
- **例外**: ファイル形式が不正な場合、読み込みに失敗した場合にエラーを返す。

#### `downloadCSV(csvContent, filename)`
- **概要**: 生成されたCSV文字列をファイルとしてブラウザでダウンロードさせる。
- **入力**: 
  - `csvContent`: string (CSVデータ)
  - `filename`: string (保存ファイル名)
- **出力**: なし (ブラウザのダウンロード動作を実行)

### 2.2 CSVParser (データ解析)

テキストデータと内部データ構造の相互変換を担当します。

#### `parse(csvString)`
- **概要**: CSV文字列を解析し、操作可能なデータ構造に変換する。
- **入力**: 
  - `csvString`: string
- **出力**: 
  - `Dataset`: ヘッダーと行データを持つオブジェクト

#### `stringify(dataset)`
- **概要**: 表示中のデータ構造をCSV文字列に変換する。
- **入力**: 
  - `dataset`: Dataset (現在の表示用データ)
- **出力**: 
  - `string`: CSV形式のテキストデータ

### 2.3 DataProcessor (データ加工)

データのフィルタリング、ソート、整形などのロジックを担当します。

#### `filterByKeyword(dataset, keyword)`
- **概要**: キーワードに一致する行のみを抽出する。
- **入力**: 
  - `dataset`: Dataset
  - `keyword`: string (検索語句)
- **出力**: 
  - `Dataset`: 条件に一致した行のみを含む新しいデータセット

#### `sortByColumn(dataset, columnName, order)`
- **概要**: 指定された列を基準に行を並び替える。
- **入力**: 
  - `dataset`: Dataset
  - `columnName`: string (ソート基準の列名)
  - `order`: SortOrder ('asc' | 'desc')
- **出力**: 
  - `Dataset`: 並び替え済みの新しいデータセット

#### `selectColumns(dataset, targetColumns)`
- **概要**: 指定された列のみを抽出する（表示列の制御）。
- **入力**: 
  - `dataset`: Dataset
  - `targetColumns`: string[] (表示対象の列名リスト)
- **出力**: 
  - `Dataset`: 指定列のみを含む新しいデータセット

### 2.4 ViewManager (画面表示管理・状態管理)

UIの状態とデータ処理の連携を担当（概念的な機能）。

#### `updateView(state)`
- **概要**: 現在のアプリケーション状態（元データ、フィルタ条件、ソート条件、表示列設定）に基づき、DataProcessorのメソッドを組み合わせて最終的な表示データを作成し、UIを更新する。
- **入力**: 
  - `state`: 現在の全設定状態
- **出力**: なし (DOMの更新)
