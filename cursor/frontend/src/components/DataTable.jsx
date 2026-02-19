import { useState, useMemo } from 'react'

const DataTable = ({
  data = [],
  columns = [],
  keyField = 'id',
  searchable = true,
  searchPlaceholder = 'Search...',
  pagination = true,
  itemsPerPage = 10,
  onRowClick = null,
  rowActions = [],
  emptyState = null,
  loading = false,
}) => {
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [showAllColumns, setShowAllColumns] = useState(false)
  const [showActionsMenu, setShowActionsMenu] = useState(null)

  // Define visible columns for mobile (first 2 columns only by default)
  const visibleColumns = showAllColumns ? columns : columns.slice(0, 2)
  const hiddenColumnsCount = columns.length - 2

  // Handle sorting
  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
    setCurrentPage(1)
  }

  // Filter and sort data
  const processedData = useMemo(() => {
    let filtered = [...data]

    // Apply search filter
    if (searchQuery && searchable) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((row) =>
        columns.some((col) => {
          if (!col.searchable && col.searchable !== undefined) return false
          const value = getNestedValue(row, col.key)
          return value?.toString().toLowerCase().includes(query)
        })
      )
    }

    // Apply sorting
    if (sortConfig.key) {
      filtered.sort((a, b) => {
        const aVal = getNestedValue(a, sortConfig.key)
        const bVal = getNestedValue(b, sortConfig.key)

        if (aVal === null || aVal === undefined) return 1
        if (bVal === null || bVal === undefined) return -1

        if (typeof aVal === 'string') {
          return sortConfig.direction === 'asc'
            ? aVal.localeCompare(bVal)
            : bVal.localeCompare(aVal)
        }

        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal
      })
    }

    return filtered
  }, [data, searchQuery, sortConfig, columns, searchable])

  // Pagination
  const totalPages = Math.ceil(processedData.length / itemsPerPage)
  const paginatedData = pagination
    ? processedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : processedData

  // Helper to get nested object values
  function getNestedValue(obj, path) {
    return path.split('.').reduce((acc, part) => acc?.[part], obj)
  }

  // Get sort icon
  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return (
        <svg className="w-4 h-4 text-gray-300 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      )
    }
    return sortConfig.direction === 'asc' ? (
      <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    )
  }

  if (loading) {
    return (
      <div className="card">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-gray-200 rounded w-full"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded w-full"></div>
          ))}
        </div>
      </div>
    )
  }

  if (data.length === 0 && emptyState) {
    return emptyState
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      {searchable && (
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              className="input-field pl-10"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-text-primary"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <span className="text-sm text-text-secondary">
            {processedData.length} {processedData.length === 1 ? 'item' : 'items'}
          </span>
        </div>
      )}

      {/* Mobile Column Toggle */}
      {columns.length > 2 && (
        <div className="lg:hidden">
          <button
            onClick={() => setShowAllColumns(!showAllColumns)}
            className="text-sm text-primary hover:text-primary-dark flex items-center gap-1 touch-target py-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
            </svg>
            {showAllColumns ? 'Show Less' : `Show ${hiddenColumnsCount} More Columns`}
          </button>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto rounded-lg border border-border-light">
        <table className="w-full">
          <thead className="bg-background-grey">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-sm font-semibold text-text-primary whitespace-nowrap ${
                    column.sortable !== false ? 'cursor-pointer hover:bg-gray-100' : ''
                  }`}
                  onClick={() => column.sortable !== false && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {column.sortable !== false && getSortIcon(column.key)}
                  </div>
                </th>
              ))}
              {rowActions.length > 0 && (
                <th className="px-4 py-3 text-left text-sm font-semibold text-text-primary">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {paginatedData.map((row, index) => (
              <tr
                key={row[keyField] || index}
                className={`bg-white hover:bg-background-grey transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                }`}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-4 py-3 text-sm text-text-primary whitespace-nowrap">
                    {column.render
                      ? column.render(getNestedValue(row, column.key), row)
                      : getNestedValue(row, column.key)}
                  </td>
                ))}
                {rowActions.length > 0 && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {rowActions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={(e) => {
                            e.stopPropagation()
                            action.onClick(row)
                          }}
                          disabled={action.disabled?.(row)}
                          className={`p-2 rounded-lg transition-colors touch-target ${
                            action.className || 'text-text-secondary hover:text-primary hover:bg-blue-50'
                          } ${action.disabled?.(row) ? 'opacity-50 cursor-not-allowed' : ''}`}
                          title={action.label}
                        >
                          {action.icon}
                        </button>
                      ))}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-3">
        {paginatedData.map((row, index) => (
          <div
            key={row[keyField] || index}
            className={`card p-4 ${onRowClick ? 'cursor-pointer' : ''}`}
            onClick={() => onRowClick && onRowClick(row)}
          >
            <div className="flex flex-col gap-3">
              {/* Visible Columns */}
              {visibleColumns.map((column) => (
                <div key={column.key} className="flex justify-between items-start">
                  <span className="text-xs text-text-secondary uppercase tracking-wide">
                    {column.title}
                  </span>
                  <span className="text-sm text-text-primary text-right font-medium">
                    {column.render
                      ? column.render(getNestedValue(row, column.key), row)
                      : getNestedValue(row, column.key)}
                  </span>
                </div>
              ))}

              {/* Hidden Columns (collapsible) */}
              {!showAllColumns && hiddenColumnsCount > 0 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setShowAllColumns(true)
                  }}
                  className="text-xs text-primary hover:text-primary-dark py-1 touch-target"
                >
                  +{hiddenColumnsCount} more
                </button>
              )}

              {/* Actions */}
              {rowActions.length > 0 && (
                <div className="flex items-center gap-2 pt-2 border-t border-border-light mt-2">
                  {rowActions.map((action, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => {
                        e.stopPropagation()
                        action.onClick(row)
                      }}
                      disabled={action.disabled?.(row)}
                      className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-colors touch-target flex items-center justify-center gap-1.5 ${
                        action.className || 'text-text-secondary hover:text-primary hover:bg-blue-50'
                      } ${action.disabled?.(row) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {action.icon}
                      <span>{action.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="btn-secondary w-full sm:w-auto touch-target py-2.5 px-4"
          >
            Previous
          </button>
          <div className="flex items-center gap-1 overflow-x-auto max-w-full">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`min-w-[40px] h-10 rounded-lg font-medium transition-colors touch-target ${
                  currentPage === page
                    ? 'bg-primary text-white'
                    : 'text-text-secondary hover:bg-background-grey'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="btn-secondary w-full sm:w-auto touch-target py-2.5 px-4"
          >
            Next
          </button>
        </div>
      )}

      {/* Empty State */}
      {processedData.length === 0 && data.length > 0 && (
        <div className="card text-center py-12">
          <p className="text-text-secondary">No items match your search criteria.</p>
        </div>
      )}
    </div>
  )
}

export default DataTable
