import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { FileUpload } from '../../components/FileUpload'

describe('FileUpload', () => {
    it('ドラッグ＆ドロップエリアが描画される', () => {
        render(<FileUpload onFileSelect={vi.fn()} />)
        expect(screen.getByRole('region', { name: /drop/i })).toBeInTheDocument()
    })

    it('CSV以外のファイルをドロップするとエラーメッセージが表示される', async () => {
        render(<FileUpload onFileSelect={vi.fn()} />)
        const dropArea = screen.getByRole('region', { name: /drop/i })
        const file = new File(['hello'], 'hello.txt', { type: 'text/plain' })

        await userEvent.upload(dropArea, file)

        expect(screen.getByRole('alert')).toBeInTheDocument()
    })

    it('CSVファイルをドロップするとonFileSelectが呼ばれる', async () => {
        const onFileSelect = vi.fn()
        render(<FileUpload onFileSelect={onFileSelect} />)
        const dropArea = screen.getByRole('region', { name: /drop/i })
        const file = new File(['name,age\nAlice,30'], 'data.csv', { type: 'text/csv' })

        await userEvent.upload(dropArea, file)

        expect(onFileSelect).toHaveBeenCalledOnce()
        expect(onFileSelect).toHaveBeenCalledWith(file)
    })

    // --- 次イテレーション ---
    it('dragover イベントでドロップ受け入れ可能なビジュアルフィードバックが表示される', () => {
        render(<FileUpload onFileSelect={vi.fn()} />)
        const dropArea = screen.getByRole('region', { name: /drop/i })

        fireEvent.dragOver(dropArea)

        expect(dropArea).toHaveAttribute('data-dragging', 'true')
    })

    it('dragleave イベントでビジュアルフィードバックが解除される', () => {
        render(<FileUpload onFileSelect={vi.fn()} />)
        const dropArea = screen.getByRole('region', { name: /drop/i })

        fireEvent.dragOver(dropArea)
        fireEvent.dragLeave(dropArea)

        expect(dropArea).not.toHaveAttribute('data-dragging', 'true')
    })

    it('エラー表示後に正しいCSVをドロップするとエラーメッセージが消える', async () => {
        render(<FileUpload onFileSelect={vi.fn()} />)
        const dropArea = screen.getByRole('region', { name: /drop/i })

        const txtFile = new File(['hello'], 'hello.txt', { type: 'text/plain' })
        await userEvent.upload(dropArea, txtFile)
        expect(screen.getByRole('alert')).toBeInTheDocument()

        const csvFile = new File(['name,age\nAlice,30'], 'data.csv', { type: 'text/csv' })
        await userEvent.upload(dropArea, csvFile)

        expect(screen.queryByRole('alert')).not.toBeInTheDocument()
    })

    // --- 次イテレーション ---
    it.todo('ファイルを読み込み中はローディングインジケーターが表示される')
    it.todo('エラーメッセージの右に「×」ボタンがあり、クリックするとエラーが消える')
    it.todo('データ読み込み後はドロップエリアがコンパクト表示に切り替わる')
})
