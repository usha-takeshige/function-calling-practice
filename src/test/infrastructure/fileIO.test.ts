import { describe, it, expect, vi, beforeEach } from 'vitest'
import { readTextFromFile, downloadCSV } from '../../infrastructure/fileIO'

describe('FileIO', () => {
    describe('readTextFromFile()', () => {
        it('ファイルを正常に読み込んだ場合、テキスト文字列を返す', async () => {
            const mockContent = 'name,age\nAlice,30'
            const file = new File([mockContent], 'test.csv', { type: 'text/csv' })

            const result = await readTextFromFile(file)
            expect(result).toBe(mockContent)
        })

        it('読み込みエラー時にFileReadErrorでrejectされる', async () => {
            // FileReaderを強制的にエラー状態にするモック
            const originalFileReader = globalThis.FileReader
            const mockFileReader = {
                readAsText: vi.fn(function (this: { onerror: (() => void) | null }) {
                    setTimeout(() => this.onerror?.(), 0)
                }),
                onload: null as (() => void) | null,
                onerror: null as (() => void) | null,
                result: null,
            }
            vi.spyOn(globalThis, 'FileReader').mockImplementation(
                () => mockFileReader as unknown as FileReader,
            )

            const file = new File(['content'], 'test.csv')
            await expect(readTextFromFile(file)).rejects.toThrow('FileReadError')

            globalThis.FileReader = originalFileReader
        })
    })

    describe('downloadCSV()', () => {
        beforeEach(() => {
            // URL.createObjectURL と revokeObjectURL をモック化
            vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:mock-url')
            vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => { })
            // document.body.append と anchor click をモック化
            vi.spyOn(document.body, 'appendChild').mockImplementation((el) => el)
            vi.spyOn(document.body, 'removeChild').mockImplementation((el) => el)
        })

        it('Blobとアンカータグによるダウンロードが発火する', () => {
            const mockClick = vi.fn()
            vi.spyOn(document, 'createElement').mockReturnValue(
                Object.assign(document.createElement('a'), { click: mockClick }),
            )

            downloadCSV('name,age\nAlice,30', 'output.csv')

            expect(URL.createObjectURL).toHaveBeenCalledOnce()
            expect(mockClick).toHaveBeenCalledOnce()
        })
    })
})
