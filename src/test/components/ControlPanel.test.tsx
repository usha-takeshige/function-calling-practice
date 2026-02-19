import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ControlPanel } from '../../components/ControlPanel'
import type { ColumnConfig } from '../../types'

const columns: ColumnConfig[] = [
    { name: 'name', isVisible: true },
    { name: 'age', isVisible: true },
    { name: 'city', isVisible: false },
]

describe('ControlPanel', () => {
    it('列名のチェックボックスが全列分描画される', () => {
        render(
            <ControlPanel
                columns={columns}
                isExportDisabled={false}
                onToggleColumn={vi.fn()}
                onFilterChange={vi.fn()}
                onExport={vi.fn()}
            />,
        )
        expect(screen.getByRole('checkbox', { name: 'name' })).toBeInTheDocument()
        expect(screen.getByRole('checkbox', { name: 'age' })).toBeInTheDocument()
        expect(screen.getByRole('checkbox', { name: 'city' })).toBeInTheDocument()
    })

    it('チェックボックスをOFFにするとonToggleColumnが呼ばれる', async () => {
        const onToggleColumn = vi.fn()
        render(
            <ControlPanel
                columns={columns}
                isExportDisabled={false}
                onToggleColumn={onToggleColumn}
                onFilterChange={vi.fn()}
                onExport={vi.fn()}
            />,
        )
        await userEvent.click(screen.getByRole('checkbox', { name: 'name' }))
        expect(onToggleColumn).toHaveBeenCalledWith('name')
    })

    it('検索ボックスに入力するとonFilterChangeが呼ばれる', async () => {
        const onFilterChange = vi.fn()
        render(
            <ControlPanel
                columns={columns}
                isExportDisabled={false}
                onToggleColumn={vi.fn()}
                onFilterChange={onFilterChange}
                onExport={vi.fn()}
            />,
        )
        await userEvent.type(screen.getByRole('searchbox'), 'Alice')
        expect(onFilterChange).toHaveBeenLastCalledWith('Alice')
    })

    it('isExportDisabledがtrueのときエクスポートボタンがdisabledになる', () => {
        render(
            <ControlPanel
                columns={columns}
                isExportDisabled={true}
                onToggleColumn={vi.fn()}
                onFilterChange={vi.fn()}
                onExport={vi.fn()}
            />,
        )
        expect(screen.getByRole('button', { name: /export/i })).toBeDisabled()
    })

    it('isExportDisabledがfalseのときエクスポートボタンをクリックするとonExportが呼ばれる', async () => {
        const onExport = vi.fn()
        render(
            <ControlPanel
                columns={columns}
                isExportDisabled={false}
                onToggleColumn={vi.fn()}
                onFilterChange={vi.fn()}
                onExport={onExport}
            />,
        )
        await userEvent.click(screen.getByRole('button', { name: /export/i }))
        expect(onExport).toHaveBeenCalledOnce()
    })
})
