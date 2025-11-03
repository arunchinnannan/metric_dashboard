import React from 'react'

export default function FilterBadges({ filters }) {
  const activeFilters = []

  if (filters.dateRange?.start) activeFilters.push(`From: ${filters.dateRange.start}`)
  if (filters.dateRange?.end) activeFilters.push(`To: ${filters.dateRange.end}`)
  if (filters.clusters?.length) activeFilters.push(`Clusters: ${filters.clusters.length}`)
  if (filters.namespaces?.length) activeFilters.push(`Namespaces: ${filters.namespaces.length}`)
  if (filters.environments?.length) activeFilters.push(`Environments: ${filters.environments.length}`)
  if (filters.applications?.length) activeFilters.push(`Apps: ${filters.applications.length}`)
  if (filters.poolIds?.length) activeFilters.push(`Pools: ${filters.poolIds.length}`)
  if (filters.dataPlanes?.length) activeFilters.push(`Data Planes: ${filters.dataPlanes.length}`)
  if (filters.motsIds?.length) activeFilters.push(`MOTS IDs: ${filters.motsIds.length}`)

  if (activeFilters.length === 0) return null

  return (
    <div className="sticky top-20 bg-slate-900 bg-opacity-50 backdrop-blur-xl p-4 rounded-lg mb-6 border border-white border-opacity-10 z-30">
      <div className="flex flex-wrap gap-2">
        {activeFilters.map((filter, idx) => (
          <span key={idx} className="inline-block px-3 py-1 bg-cyan-500 bg-opacity-20 border border-cyan-500 border-opacity-50 rounded-full text-cyan-300 text-sm">
            {filter}
          </span>
        ))}
      </div>
    </div>
  )
}
