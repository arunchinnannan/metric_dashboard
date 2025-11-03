import React from 'react'
import MultiSelectDropdown from './MultiSelectDropdown'

export default function FilterPanel({ filterOptions, filterOptionsLoading, filters, onFilterChange, onResetFilters }) {
  const handleDateChange = (field, value) => {
    onFilterChange({
      ...filters,
      dateRange: { ...filters.dateRange, [field]: value }
    })
  }

  const handleMultiSelectChange = (field, selectedValues) => {
    onFilterChange({
      ...filters,
      [field]: selectedValues
    })
  }

  return (
    <div className="fixed left-0 top-20 bottom-0 w-80 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-white border-opacity-10 p-6 overflow-y-auto z-40">
      <h2 className="text-lg font-bold text-white mb-6">Filters</h2>

      <div className="border-b border-white border-opacity-10 pb-4 mb-4">
        <h3 className="text-sm font-semibold text-white mb-3">Date Range</h3>
        <div className="space-y-2">
          <input
            type="date"
            value={filters.dateRange.start || ''}
            onChange={(e) => handleDateChange('start', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
          />
          <input
            type="date"
            value={filters.dateRange.end || ''}
            onChange={(e) => handleDateChange('end', e.target.value)}
            className="w-full px-3 py-2 bg-slate-800 border border-slate-600 rounded text-white text-sm"
          />
        </div>
      </div>

      <div className="space-y-4">
        <MultiSelectDropdown
          title="Clusters"
          options={filterOptions?.clusters || []}
          selectedValues={filters.clusters || []}
          onChange={(values) => handleMultiSelectChange('clusters', values)}
          placeholder="Select clusters..."
          loading={filterOptionsLoading}
        />

        <MultiSelectDropdown
          title="Namespaces"
          options={filterOptions?.namespaces || []}
          selectedValues={filters.namespaces || []}
          onChange={(values) => handleMultiSelectChange('namespaces', values)}
          placeholder="Select namespaces..."
          loading={filterOptionsLoading}
        />

        <MultiSelectDropdown
          title="Environments"
          options={filterOptions?.environments || []}
          selectedValues={filters.environments || []}
          onChange={(values) => handleMultiSelectChange('environments', values)}
          placeholder="Select environments..."
          loading={filterOptionsLoading}
        />

        <MultiSelectDropdown
          title="Data Planes"
          options={filterOptions?.dataPlanes || []}
          selectedValues={filters.dataPlanes || []}
          onChange={(values) => handleMultiSelectChange('dataPlanes', values)}
          placeholder="Select data planes..."
          loading={filterOptionsLoading}
        />

        <MultiSelectDropdown
          title="Applications"
          options={filterOptions?.applications || []}
          selectedValues={filters.applications || []}
          onChange={(values) => handleMultiSelectChange('applications', values)}
          placeholder="Select applications..."
          loading={filterOptionsLoading}
        />

        <MultiSelectDropdown
          title="Pool IDs"
          options={filterOptions?.poolIds || []}
          selectedValues={filters.poolIds || []}
          onChange={(values) => handleMultiSelectChange('poolIds', values)}
          placeholder="Select pool IDs..."
          loading={filterOptionsLoading}
        />

        <MultiSelectDropdown
          title="MOTS IDs"
          options={filterOptions?.motsIds || []}
          selectedValues={filters.motsIds || []}
          onChange={(values) => handleMultiSelectChange('motsIds', values)}
          placeholder="Select MOTS IDs..."
          loading={filterOptionsLoading}
        />
      </div>

      <div className="mt-8 pt-4 border-t border-white border-opacity-10">
        <button
          onClick={onResetFilters}
          className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-all"
        >
          Reset Filters
        </button>
      </div>
    </div>
  )
}
