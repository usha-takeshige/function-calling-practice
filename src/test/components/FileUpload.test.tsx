import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
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
})
