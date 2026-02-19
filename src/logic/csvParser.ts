import type { Dataset } from '../types'

export class ParseError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'ParseError'
    }
}

export function parse(_csvString: string): Dataset {
    throw new Error('ParseError: Not implemented')
}

export function stringify(_dataset: Dataset): string {
    throw new Error('Not implemented')
}
