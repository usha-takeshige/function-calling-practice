import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { FileReadError, readTextFromFile, downloadCSV } from '../../infrastructure/fileIO'

describe('FileIO', () => {
    describe('readTextFromFile()', () => {
        it('ファイルを正常に読み込んだ場合、テキスト文字列を返す', async () => {
            const mockContent = 'name,age\nAlice,30'
            const file = new File([mockContent], 'test.csv', { type: 'text/csv' })

            const result = await readTextFromFile(file)
            expect(result).toBe(mockContent)
        })

        it('読み込みエラー時にFileReadErrorでrejectされる', async () => {
            // FileReaderのonerrorを強制的に発火させるモック
            const mockFileReader = {
                readAsText: vi.fn(function (this: typeof mockFileReader) {
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
            await expect(readTextFromFile(file)).rejects.toThrowError(FileReadError)

            vi.restoreAllMocks()
        })
    })

    describe('downloadCSV()', () => {
        beforeEach(() => {
            // jsdom環境にはURL.createObjectURLが存在しないため、グローバルに定義する
            globalThis.URL.createObjectURL = vi.fn().mockReturnValue('blob:mock-url')
            globalThis.URL.revokeObjectURL = vi.fn()
            vi.spyOn(document.body, 'appendChild').mockImplementation((el) => el)
            vi.spyOn(document.body, 'removeChild').mockImplementation((el) => el)
        })

        afterEach(() => {
            vi.restoreAllMocks()
        })

        it('Blobとアンカータグによるダウンロードが発火する', () => {
            const mockClick = vi.fn()
            const mockAnchor = Object.assign(document.createElement('a'), {
                click: mockClick,
            })
            vi.spyOn(document, 'createElement').mockReturnValue(mockAnchor)

            downloadCSV('name,age\nAlice,30', 'output.csv')

            expect(URL.createObjectURL).toHaveBeenCalledOnce()
            expect(mockClick).toHaveBeenCalledOnce()
        })
    })
})
