import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { App } from '../../components/App'
import { downloadCSV } from '../../infrastructure/fileIO'

vi.mock('../../infrastructure/fileIO', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../infrastructure/fileIO')>()
    return {
        ...actual,
        downloadCSV: vi.fn(),
    }
})

describe('App (Integration)', () => {
    beforeEach(() => {
        vi.clearAllMocks()
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

        expect(downloadCSV).toHaveBeenCalled()
    })

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

        await userEvent.click(screen.getByRole('columnheader', { name: 'name' }))
        await userEvent.click(screen.getByRole('columnheader', { name: 'name' }))

        const rows = screen.getAllByRole('row')
        expect(within(rows[1]).getByText('Bob')).toBeInTheDocument()
        expect(within(rows[2]).getByText('Alice')).toBeInTheDocument()
    })

    it('不正なCSVファイルをドロップするとエラーメッセージが表示される', async () => {
        render(<App />)
        const dropArea = screen.getByRole('region', { name: /drop/i })
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

        expect(downloadCSV).toHaveBeenCalledWith(expect.any(String), 'my_data.csv')
    })

    it('別のCSVをドロップすると前のデータが上書きされる', async () => {
        render(<App />)
        const dropArea = screen.getByRole('region', { name: /drop/i })
        const file1 = new File(['name\nAlice'], 'file1.csv', { type: 'text/csv' })
        await userEvent.upload(dropArea, file1)
        await screen.findByRole('table')

        const dropAreaAfter = screen.getByRole('region', { name: /drop/i })
        const file2 = new File(['city\nTokyo'], 'file2.csv', { type: 'text/csv' })
        await userEvent.upload(dropAreaAfter, file2)

        await screen.findByRole('columnheader', { name: 'city' })
        expect(screen.queryByRole('columnheader', { name: 'name' })).not.toBeInTheDocument()
    })

    // --- 次イテレーション ---
    it.todo('エラーメッセージの×ボタンをクリックするとエラーが消えて再アップロード可能になる')
    it.todo('ソート中に列ヘッダーを3回クリックするとソートがリセットされる')
    it.todo('フィルタとソートを同時に適用すると両方が有効になる')
    it.todo('実際のドラッグ＆ドロップでCSVをアップロードするとデータが表示される')
    it.todo('全列を非表示にしてもControlPanelの「全列を表示」ボタンは표示されたまま(disabled)になる')
})
