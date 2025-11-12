import React, { useState } from 'react'
import { formatBytes, formatDate } from '../utils/formatters'
import axios from 'axios'

// Use base path for API calls - nginx will proxy to backend service
// In production: /app-metrics-dashboard/api -> nginx -> backend:5000/api
// In dev: /api -> vite proxy -> localhost:5000/api
const API_URL = import.meta.env.BASE_URL === '/' ? '/api' : '/app-metrics-dashboard/api'

export default function MetricsTable({ data, filters, loading }) {
  const [page, setPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState(null)
  const [expandedRows, setExpandedRows] = useState(new Set())

  const handleSort = (field) => {
    setSortConfig({
      field,
      direction: sortConfig?.field === field && sortConfig.direction === 'asc' ? 'desc' : 'asc'
    })
  }

  const toggleExpandRow = (rowIdx) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(rowIdx)) {
      newExpanded.delete(rowIdx)
    } else {
      newExpanded.add(rowIdx)
    }
    setExpandedRows(newExpanded)
  }

  if (loading) {
    return (
      <div className="bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 rounded-xl p-6 h-96 animate-pulse">
        <div className="h-full bg-slate-800 bg-opacity-30 rounded-lg"></div>
      </div>
    )
  }

  const tableData = data?.data || []
  const totalPages = data?.totalPages || 1

  const filteredData = tableData.filter(row =>
    JSON.stringify(row).toLowerCase().includes(searchTerm.toLowerCase())
  )

  let sortedData = [...filteredData]
  if (sortConfig) {
    sortedData.sort((a, b) => {
      const aVal = a[sortConfig.field]
      const bVal = b[sortConfig.field]
      const comparison = aVal > bVal ? 1 : -1
      return sortConfig.direction === 'asc' ? comparison : -comparison
    })
  }

  const SortIcon = ({ field }) => {
    if (sortConfig?.field !== field) return ' ↕'
    return sortConfig.direction === 'asc' ? ' ↑' : ' ↓'
  }

  return (
    <div className="bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 rounded-xl p-6">
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search table..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-400"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-slate-800 bg-opacity-50">
            <tr>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-700" onClick={() => handleSort('metric_date')}>
                Date<SortIcon field="metric_date" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-700" onClick={() => handleSort('cluster_name')}>
                Cluster<SortIcon field="cluster_name" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-700" onClick={() => handleSort('namespace')}>
                Namespace<SortIcon field="namespace" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-700" onClick={() => handleSort('application_name')}>
                Application<SortIcon field="application_name" />
              </th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-700" onClick={() => handleSort('environment')}>
                Environment<SortIcon field="environment" />
              </th>
              <th className="px-4 py-3 text-right cursor-pointer hover:bg-slate-700" onClick={() => handleSort('consumedbytes')}>
                Consumed<SortIcon field="consumedbytes" />
              </th>
              <th className="px-4 py-3 text-right cursor-pointer hover:bg-slate-700" onClick={() => handleSort('producedbytes')}>
                Produced<SortIcon field="producedbytes" />
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((row, idx) => (
              <React.Fragment key={idx}>
                <tr 
                  onClick={() => toggleExpandRow(idx)}
                  className="border-t border-white border-opacity-10 hover:bg-white hover:bg-opacity-5 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3 text-slate-300">{formatDate(row.metric_date)}</td>
                  <td className="px-4 py-3 text-slate-300">{row.cluster_name}</td>
                  <td className="px-4 py-3 text-slate-300">{row.namespace}</td>
                  <td className="px-4 py-3 text-slate-300">{row.application_name || '-'}</td>
                  <td className="px-4 py-3 text-slate-300">{row.environment || '-'}</td>
                  <td className="px-4 py-3 text-right text-cyan-400">{formatBytes(row.consumedbytes)}</td>
                  <td className="px-4 py-3 text-right text-purple-400">{formatBytes(row.producedbytes)}</td>
                </tr>
                {expandedRows.has(idx) && (
                  <tr className="border-t border-white border-opacity-10 bg-white bg-opacity-5">
                    <td colSpan="7" className="px-4 py-4">
                      <div className="space-y-2">
                        <div><span className="font-semibold text-slate-300">Owners:</span> <span className="text-slate-400">{row.owners?.join(', ') || '-'}</span></div>
                        <div><span className="font-semibold text-slate-300">Stakeholders:</span> <span className="text-slate-400">{row.stakeholders?.join(', ') || '-'}</span></div>
                        <div><span className="font-semibold text-slate-300">MOTS ID:</span> <span className="text-slate-400">{row.mots_id || '-'}</span></div>
                        <div><span className="font-semibold text-slate-300">Pool ID:</span> <span className="text-slate-400">{row.pool_id}</span></div>
                        <div><span className="font-semibold text-slate-300">Data Plane:</span> <span className="text-slate-400">{row.data_plane || '-'}</span></div>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {sortedData.length === 0 && (
        <div className="text-center py-8 text-slate-400">
          No data found
        </div>
      )}

      <div className="flex items-center justify-between mt-6 pt-4 border-t border-white border-opacity-10">
        <div className="text-sm text-slate-400">
          Showing {(page - 1) * (data?.pageSize || 25) + 1} to {Math.min(page * (data?.pageSize || 25), data?.total || 0)} of {data?.total || 0} records
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPage(Math.max(1, page - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded text-white"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-white">{page} of {totalPages}</span>
          <button
            onClick={() => setPage(Math.min(totalPages, page + 1))}
            disabled={page >= totalPages}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 rounded text-white"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
