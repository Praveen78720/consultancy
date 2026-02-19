import { useState } from 'react'

const FilterPanel = ({
  filters = [],
  onFilterChange,
  onClearFilters,
  activeFilters = {},
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasActiveFilters = Object.keys(activeFilters).some(
    (key) => activeFilters[key] && activeFilters[key] !== 'all'
  )

  return (
    <div className="card mb-6">
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <svg className="w-5 h-5 text-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <span className="font-semibold text-text-primary">Filters</span>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-primary text-white text-xs rounded-full">
              Active
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onClearFilters()
              }}
              className="text-sm text-primary hover:text-primary-dark"
            >
              Clear All
            </button>
          )}
          <svg
            className={`w-5 h-5 text-text-secondary transition-transform ${
              isExpanded ? 'rotate-180' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-border-light">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-text-primary mb-2">
                  {filter.label}
                </label>
                {filter.type === 'select' && (
                  <select
                    value={activeFilters[filter.key] || 'all'}
                    onChange={(e) => onFilterChange(filter.key, e.target.value)}
                    className="input-field"
                  >
                    <option value="all">All {filter.label}</option>
                    {filter.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                )}
                {filter.type === 'date-range' && (
                  <div className="date-range-wrapper">
                    <div className="date-input-wrapper">
                      <input
                        type="date"
                        value={activeFilters[`${filter.key}_from`] || ''}
                        onChange={(e) => onFilterChange(`${filter.key}_from`, e.target.value)}
                        placeholder="From"
                      />
                    </div>
                    <span className="date-range-separator">to</span>
                    <div className="date-input-wrapper">
                      <input
                        type="date"
                        value={activeFilters[`${filter.key}_to`] || ''}
                        onChange={(e) => onFilterChange(`${filter.key}_to`, e.target.value)}
                        placeholder="To"
                      />
                    </div>
                  </div>
                )}
                {filter.type === 'search' && (
                  <div className="relative">
                    <svg
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary"
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
                      value={activeFilters[filter.key] || ''}
                      onChange={(e) => onFilterChange(filter.key, e.target.value)}
                      placeholder={filter.placeholder || `Search ${filter.label}...`}
                      className="input-field pl-10"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default FilterPanel
