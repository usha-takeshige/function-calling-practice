import { useState } from 'react'

interface FileUploadProps {
    onFileSelect: (file: File) => void
}

export function FileUpload({ onFileSelect }: FileUploadProps) {
    const [error, setError] = useState<string | null>(null)

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return

        const isCSV =
            file.type === 'text/csv' ||
            file.name.toLowerCase().endsWith('.csv')

        if (!isCSV) {
            setError('CSVファイルのみ対応しています')
            return
        }

        setError(null)
        onFileSelect(file)
    }

    return (
        <div>
            {/*
       * label[role="region"] にすることで:
       *  1. getByRole('region', { name: /drop/i }) で取得可能
       *  2. userEvent.upload がラベルの control（= input）を自動で使用
       * accept 属性は付けない（jsdomの userEvent.upload がCSV以外をブロックするため）
       */}
            <label role="region" aria-label="Drop area">
                <input
                    type="file"
                    onChange={handleChange}
                    style={{ display: 'none' }}
                />
                <span>CSVファイルをここにドロップ、またはクリックして選択</span>
            </label>

            {/* role="alert" は label の外に置くことでアクセシビリティツリーに確実に公開する */}
            {error && <p role="alert">{error}</p>}
        </div>
    )
}
