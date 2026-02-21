export class FileReadError extends Error {
    constructor(message: string) {
        super(message)
        this.name = 'FileReadError'
    }
}

export function readTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => {
            resolve(reader.result as string)
        }
        reader.onerror = () => {
            reject(new FileReadError(`Failed to read file: ${file.name}`))
        }
        reader.readAsText(file)
    })
}

export function downloadCSV(csvContent: string, filename: string): void {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = filename
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(url)
}
