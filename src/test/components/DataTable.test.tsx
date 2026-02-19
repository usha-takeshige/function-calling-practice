import { describe, it, expect, vi } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { DataTable } from '../../components/DataTable'
import type { Dataset, SortOrder } from '../../types'

const dataset: Dataset = {
    headers: ['name', 'age'],
    rows: [
        ['Alice', '30'],
        ['Bob', '25'],
    ],
}

describe('DataTable', () => {
    it('ヘッダー行とデータ行が正しく描画される', () => {
        render(
            <DataTable
                dataset={dataset}
                sortOrder={null}
                onHeaderClick={vi.fn()}
            />,
        )
        expect(screen.getByRole('columnheader', { name: 'name' })).toBeInTheDocument()
        expect(screen.getByRole('columnheader', { name: 'age' })).toBeInTheDocument()
        const rows = screen.getAllByRole('row')
        // 1行目はヘッダー、2行目以降がデータ
        expect(within(rows[1]).getByText('Alice')).toBeInTheDocument()
        expect(within(rows[2]).getByText('Bob')).toBeInTheDocument()
    })

    it('列ヘッダーをクリックするとonHeaderClickが呼ばれる', async () => {
        const onHeaderClick = vi.fn()
        render(
            <DataTable
                dataset={dataset}
                sortOrder={null}
                onHeaderClick={onHeaderClick}
            />,
        )
        await userEvent.click(screen.getByRole('columnheader', { name: 'name' }))
        expect(onHeaderClick).toHaveBeenCalledWith('name')
    })

    it('昇順ソート中の列ヘッダーに昇順アイコンが表示される', () => {
        const sortOrder: SortOrder = { column: 'name', direction: 'asc' }
        render(
            <DataTable
                dataset={dataset}
                sortOrder={sortOrder}
                onHeaderClick={vi.fn()}
            />,
        )
        const nameHeader = screen.getByRole('columnheader', { name: /name/i })
        expect(nameHeader).toHaveAttribute('aria-sort', 'ascending')
    })

    it('降順ソート中の列ヘッダーに降順アイコンが表示される', () => {
        const sortOrder: SortOrder = { column: 'name', direction: 'desc' }
        render(
            <DataTable
                dataset={dataset}
                sortOrder={sortOrder}
                onHeaderClick={vi.fn()}
            />,
        )
        const nameHeader = screen.getByRole('columnheader', { name: /name/i })
        expect(nameHeader).toHaveAttribute('aria-sort', 'descending')
    })

    it('データが空のとき行が描画されない', () => {
        const emptyDataset: Dataset = { headers: ['name', 'age'], rows: [] }
        render(
            <DataTable
                dataset={emptyDataset}
                sortOrder={null}
                onHeaderClick={vi.fn()}
            />,
        )
        // ヘッダー行(1) + フッター行(1) = 2
        const rows = screen.getAllByRole('row')
        expect(rows).toHaveLength(2)
    })

    it('ソートされていない列ヘッダーにはaria-sort属性がない', () => {
        const sortOrder: SortOrder = { column: 'name', direction: 'asc' }
        render(
            <DataTable
                dataset={dataset}
                sortOrder={sortOrder}
                onHeaderClick={vi.fn()}
            />,
        )
        // 'age' 列はソート対象外なので aria-sort がないはず
        const ageHeader = screen.getByRole('columnheader', { name: 'age' })
        expect(ageHeader).not.toHaveAttribute('aria-sort')
    })

    it('Enterキーで列ヘッダーをクリックするとonHeaderClickが呼ばれる', async () => {
        const onHeaderClick = vi.fn()
        render(
            <DataTable
                dataset={dataset}
                sortOrder={null}
                onHeaderClick={onHeaderClick}
            />,
        )
        const nameHeader = screen.getByRole('columnheader', { name: 'name' })
        nameHeader.focus()
        await userEvent.keyboard('[Enter]')

        expect(onHeaderClick).toHaveBeenCalledWith('name')
    })

    it('行数が多い場合に件数を表示するフッターが描画される', () => {
        const largeDataset: Dataset = {
            headers: ['name'],
            rows: Array.from({ length: 100 }, (_, i) => [`row${i}`]),
        }
        render(
            <DataTable
                dataset={largeDataset}
                sortOrder={null}
                onHeaderClick={vi.fn()}
            />,
        )
        // tfoot または contentinfo ロールに行数が表示される
        expect(screen.getByRole('contentinfo')).toHaveTextContent('100')
    })
})
