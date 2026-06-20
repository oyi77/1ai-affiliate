import { useState } from 'react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ArrowUp, ArrowDown, Search, Download } from 'lucide-react';

export function DataTable({ data = [], columns, searchable = true, exportable = true, isLoading = false, emptyMessage }) {
  const [sorting, setSorting] = useState([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 25 });

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter, pagination },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const exportCSV = () => {
    const rows = table.getFilteredRowModel().rows.map(row =>
      columns.map(col => {
        const val = col.accessorKey ? row.getValue(col.accessorKey) : '';
        return String(val ?? '');
      }).join(',')
    ).join('\n');
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `export-${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-4">
        {searchable && (
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              value={globalFilter ?? ''}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-surface-2 border border-white/[0.06] rounded-md text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-accent/40"
            />
          </div>
        )}

        {exportable && (
          <button
            onClick={exportCSV}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 border border-white/[0.06] rounded-md text-xs font-medium text-slate-400 hover:text-slate-200 hover:border-white/[0.12] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            Export
          </button>
        )}
      </div>

      {isLoading ? (
        <div className="border border-white/[0.06] rounded-md">
          <table className="w-full">
            <thead>
              <tr className="table-header">
                {columns.map((col, i) => (
                  <th key={i} className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[1,2,3,4,5].map((i) => (
                <tr key={i} className="table-row animate-pulse">
                  {columns.map((_, j) => (
                    <td key={j} className="px-4 py-2.5">
                      <div className="h-4 bg-surface-3 rounded w-3/4" />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        ) : data.length === 0 ? (
          <div className="border border-white/[0.06] rounded-md">
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Search className="w-10 h-10 text-slate-600 mb-3" />
              <p className="text-slate-400 text-sm">{emptyMessage || 'No data available'}</p>
            </div>
          </div>
      ) : (
        <>
          {/* Table */}
          <div className="overflow-x-auto border border-white/[0.06] rounded-md">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="table-header">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-2.5 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={`flex items-center gap-1.5 ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-slate-200' : ''}`}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(header.column.columnDef.header, header.getContext())}
                            {header.column.getCanSort() && (
                              <span className="text-slate-500">
                                {{
                                  asc: <ArrowUp className="w-3 h-3" />,
                                  desc: <ArrowDown className="w-3 h-3" />,
                                }[header.column.getIsSorted()] ?? <ArrowUpDown className="w-3 h-3" />}
                              </span>
                            )}
                          </div>
                        )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="table-row">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2.5 text-sm text-slate-300">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between text-xs text-slate-400">
            <div>
              {table.getFilteredRowModel().rows.length > 0
                ? `Showing ${table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}–${Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)} of ${table.getFilteredRowModel().rows.length}`
                : 'No results'}
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
                className="px-2.5 py-1 bg-surface-2 border border-white/[0.06] rounded text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Prev
              </button>

              {table.getPageCount() <= 7 ? (
                [...Array(table.getPageCount())].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => table.setPageIndex(i)}
                    className={`w-7 h-7 rounded text-xs font-medium transition-colors ${
                      table.getState().pagination.pageIndex === i
                        ? 'bg-accent text-white'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-surface-2'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))
              ) : null}

              <button
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
                className="px-2.5 py-1 bg-surface-2 border border-white/[0.06] rounded text-slate-400 hover:text-slate-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
