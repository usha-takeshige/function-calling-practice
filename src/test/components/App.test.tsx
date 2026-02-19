import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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
    it.todo('列ヘッダークリックで昇順ソートされる')
    it.todo('再クリックで降順ソートに切り替わる')
    it.todo('不正なCSVファイルをドロップするとエラーメッセージが表示される')
    it.todo('エクスポート時のファイル名がアップロードしたファイルと同じになる')
    it.todo('別のCSVをドロップすると前のデータが上書きされる')
})
