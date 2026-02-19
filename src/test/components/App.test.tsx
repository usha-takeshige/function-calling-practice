import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../../components/App'

describe('App (Integration)', () => {
    beforeEach(() => {
        // URL.createObjectURL をモック化
        globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
        globalThis.URL.revokeObjectURL = vi.fn()
    })

    it('初期表示ではドラッグ＆ドロップエリアのみが表示される', () => {
        render(<App />)
        expect(screen.getByRole('region', { name: /drop/i })).toBeInTheDocument()
        expect(screen.queryByRole('table')).not.toBeInTheDocument()
    })

    it('CSVファイルをドロップするとデータテーブルが表示される', async () => {
        render(<App />)
        const dropArea = screen.getByRole('region', { name: /drop/i })
        const file = new File(['name,age\nAlice,30\nBob,25'], 'data.csv', {
            type: 'text/csv',
        })

        await userEvent.upload(dropArea, file)

        expect(await screen.findByRole('table')).toBeInTheDocument()
    })

    it('フィルタ入力後にテーブルの表示行が絞り込まれる', async () => {
        render(<App />)
        const dropArea = screen.getByRole('region', { name: /drop/i })
        const file = new File(['name,age\nAlice,30\nBob,25'], 'data.csv', {
            type: 'text/csv',
        })
        await userEvent.upload(dropArea, file)
        await screen.findByRole('table')

        await userEvent.type(screen.getByRole('searchbox'), 'alice')

        // Alice行のみ表示、Bob行は非表示
        expect(screen.getByText('Alice')).toBeInTheDocument()
        expect(screen.queryByText('Bob')).not.toBeInTheDocument()
    })

    it('列チェックボックスをOFFにすると該当列がテーブルから消える', async () => {
        render(<App />)
        const dropArea = screen.getByRole('region', { name: /drop/i })
        const file = new File(['name,age\nAlice,30'], 'data.csv', {
            type: 'text/csv',
        })
        await userEvent.upload(dropArea, file)
        await screen.findByRole('table')

        await userEvent.click(screen.getByRole('checkbox', { name: 'age' }))

        expect(screen.queryByRole('columnheader', { name: 'age' })).not.toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: 'name' })).toBeInTheDocument()
    })

    it('エクスポートボタンクリックでdownloadCSVが呼ばれる', async () => {
        render(<App />)
        const dropArea = screen.getByRole('region', { name: /drop/i })
        const file = new File(['name,age\nAlice,30'], 'data.csv', {
            type: 'text/csv',
        })
        await userEvent.upload(dropArea, file)
        await screen.findByRole('table')

        const exportButton = screen.getByRole('button', { name: /export/i })
        expect(exportButton).not.toBeDisabled()
        await userEvent.click(exportButton)

        expect(URL.createObjectURL).toHaveBeenCalledOnce()
    })

    // --- 次イテレーション ---
    it('列ヘッダークリックで昇順ソートされる', async () => {
        render(<App />)
        const dropArea = screen.getByRole('region', { name: /drop/i })
        const file = new File(['name,age\nBob,25\nAlice,30'], 'data.csv', {
            type: 'text/csv',
        })
        await userEvent.upload(dropArea, file)
        await screen.findByRole('table')

        await userEvent.click(screen.getByRole('columnheader', { name: 'name' }))

        const rows = screen.getAllByRole('row')
        // 昇順: Alice → Bob
        expect(within(rows[1]).getByText('Alice')).toBeInTheDocument()
        expect(within(rows[2]).getByText('Bob')).toBeInTheDocument()
    })

    it('再クリックで降順ソートに切り替わる', async () => {
        render(<App />)
        const dropArea = screen.getByRole('region', { name: /drop/i })
        const file = new File(['name,age\nBob,25\nAlice,30'], 'data.csv', {
            type: 'text/csv',
        })
        await userEvent.upload(dropArea, file)
        await screen.findByRole('table')

        // 1回目: 昇順
        await userEvent.click(screen.getByRole('columnheader', { name: 'name' }))
        // 2回目: 降順
        await userEvent.click(screen.getByRole('columnheader', { name: 'name' }))

        const rows = screen.getAllByRole('row')
        // 降順: Bob → Alice
        expect(within(rows[1]).getByText('Bob')).toBeInTheDocument()
        expect(within(rows[2]).getByText('Alice')).toBeInTheDocument()
    })

    it('不正なCSVファイルをドロップするとエラーメッセージが表示される', async () => {
        render(<App />)
        const dropArea = screen.getByRole('region', { name: /drop/i })
        // 列数が行によって不一致のCSV
        const file = new File(['name,age\nAlice,30,extra'], 'bad.csv', {
            type: 'text/csv',
        })
        await userEvent.upload(dropArea, file)

        expect(await screen.findByRole('alert')).toBeInTheDocument()
    })

    it('エクスポート時のファイル名がアップロードしたファイルと同じになる', async () => {
        render(<App />)
        const dropArea = screen.getByRole('region', { name: /drop/i })
        const file = new File(['name,age\nAlice,30'], 'my_data.csv', {
            type: 'text/csv',
        })
        await userEvent.upload(dropArea, file)
        await screen.findByRole('table')

        await userEvent.click(screen.getByRole('button', { name: /export/i }))

        // downloadCSV で生成されるアンカーの download 属性がファイル名と一致する
        const link = document.querySelector('a[download="my_data.csv"]')
        expect(link).not.toBeNull()
    })

    it('別のCSVをドロップすると前のデータが上書きされる', async () => {
        render(<App />)
        const dropArea = screen.getByRole('region', { name: /drop/i })
        const file1 = new File(['name\nAlice'], 'file1.csv', { type: 'text/csv' })
        await userEvent.upload(dropArea, file1)
        await screen.findByRole('table')

        // テーブル表示後もドロップエリアが残っている（or 別の手段で再アップロードできる）
        const dropAreaAfter = screen.getByRole('region', { name: /drop/i })
        const file2 = new File(['city\nTokyo'], 'file2.csv', { type: 'text/csv' })
        await userEvent.upload(dropAreaAfter, file2)

        // 新しいデータのヘッダーが表示され、古いヘッダーは消える
        await screen.findByRole('columnheader', { name: 'city' })
        expect(screen.queryByRole('columnheader', { name: 'name' })).not.toBeInTheDocument()
    })
})
