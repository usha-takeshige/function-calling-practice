export class FileReadError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'FileReadError'
    }
}

export function readTextFromFile(_file: File): Promise<string> {
    return Promise.reject(new Error('Not implemented'))
}

export function downloadCSV(_csvContent: string, _filename: string): void {
    throw new Error('Not implemented')
}
