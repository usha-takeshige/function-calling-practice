import { useState } from 'react'

interface FileUploadProps {
    onFileSelect: (file: File) => void
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
    const [error, setError] = useState<string | null>(null)
    const [isDragging, setIsDragging] = useState(false)

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        validateAndSelect(file)
    }

    function validateAndSelect(file: File) {
        const isCSV =
            file.type === 'text/csv' || file.name.toLowerCase().endsWith('.csv')

        if (!isCSV) {
            setError('CSVファイルのみ対応しています')
            return
        }

        setError(null)
        onFileSelect(file)
    }

    function handleDragOver(e: React.DragEvent) {
        e.preventDefault()
        setIsDragging(true)
    }

    function handleDragLeave(e: React.DragEvent) {
        e.preventDefault()
        setIsDragging(false)
    }

    function handleDrop(e: React.DragEvent) {
        e.preventDefault()
        setIsDragging(false)
        const file = e.dataTransfer.files?.[0]
        if (file) {
            validateAndSelect(file)
        }
    }

    return (
        <div>
            <label
                role="region"
                aria-label="Drop area"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                data-dragging={isDragging}
                style={{
                    border: isDragging ? '2px solid blue' : '1px solid gray',
                    backgroundColor: isDragging ? '#e0f7fa' : 'transparent',
                    display: 'block',
                    padding: '20px',
                }}
            >
                <input
                    type="file"
                    onChange={handleChange}
                    style={{ display: 'none' }}
                />
                <span>CSVファイルをここにドロップ、またはクリックして選択</span>
            </label>

            {error && <p role="alert">{error}</p>}
        </div>
    )
}
