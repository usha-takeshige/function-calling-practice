import { describe, it, expect } from 'vitest'
import { ParseError, parse, stringify } from '../../logic/csvParser'
import type { Dataset } from '../../types'

describe('CSVParser', () => {
    describe('parse()', () => {
        it('正常なCSV文字列をDatasetに変換できる', () => {
            const csv = 'name,age,city\nAlice,30,Tokyo\nBob,25,Osaka'
            const result = parse(csv)
            expect(result).toEqual<Dataset>({
                headers: ['name', 'age', 'city'],
                rows: [
                    ['Alice', '30', 'Tokyo'],
                    ['Bob', '25', 'Osaka'],
                ],
            })
        })

        it('空文字列を受け取った場合、{ headers: [], rows: [] } を返す', () => {
            const result = parse('')
            expect(result).toEqual<Dataset>({ headers: [], rows: [] })
        })

        it('列数が不揃いのCSVでParseErrorをスローする', () => {
            const csv = 'name,age\nAlice,30,ExtraColumn'
            expect(() => parse(csv)).toThrowError(ParseError)
        })
    })

    describe('stringify()', () => {
        it('Datasetをヘッダー行を含むCSV文字列に変換できる', () => {
            const dataset: Dataset = {
                headers: ['name', 'age'],
                rows: [
                    ['Alice', '30'],
                    ['Bob', '25'],
                ],
            }
            const result = stringify(dataset)
            expect(result).toBe('name,age\nAlice,30\nBob,25')
        })

        it('空のDatasetを受け取った場合、空文字列を返す', () => {
            const dataset: Dataset = { headers: [], rows: [] }
            const result = stringify(dataset)
            expect(result).toBe('')
        })
    })
})
