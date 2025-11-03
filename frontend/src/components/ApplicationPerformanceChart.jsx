import React, { useState } from 'react'
import { formatBytes } from '../utils/formatters'

export default function ApplicationPerformanceChart({ data, loading }) {
  const [hoveredCell, setHoveredCell] = useState(null)
  const [hoveredLegend, setHoveredLegend] = useState(null)

  if (loading) {
    return (
      <div className="bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 rounded-xl p-6 h-80 animate-pulse">
        <div className="h-full bg-slate-800 bg-opacity-30 rounded-lg"></div>
      </div>
    )
  }

  // Transform data for heatmap: group by environment and application
  const heatmapData = data.slice(0, 20).reduce((acc, d) => {
    const env = d.environment || 'Unknown'
    const app = d.application_name || 'Unknown'
    const totalVolume = (parseInt(d.total_produced) || 0) + (parseInt(d.total_consumed) || 0)

    if (totalVolume > 0) {
      if (!acc[env]) acc[env] = {}
      acc[env][app] = {
        volume: totalVolume,
        produced: parseInt(d.total_produced) || 0,
        consumed: parseInt(d.total_consumed) || 0,
        cluster: d.cluster_name || 'Unknown',
        activeDays: parseInt(d.active_days) || 1
      }
    }
    return acc
  }, {})

  // Get all unique applications and environments
  const environments = Object.keys(heatmapData).sort()
  const allApps = [...new Set(
    Object.values(heatmapData).flatMap(env => Object.keys(env))
  )].sort().slice(0, 10) // Limit to 10 apps for better display

  // Calculate max volume for color scaling
  const maxVolume = Math.max(
    ...Object.values(heatmapData).flatMap(env =>
      Object.values(env).map(app => app.volume)
    ), 1
  )

  const getIntensity = (volume) => {
    return Math.min(volume / maxVolume, 1)
  }

  const getColor = (intensity) => {
    if (intensity === 0) return '#374151' // Gray for no data

    // Create a gradient from blue to red based on intensity
    const red = Math.floor(255 * intensity)
    const blue = Math.floor(255 * (1 - intensity))
    const green = Math.floor(100 * (1 - intensity))

    return `rgb(${red}, ${green}, ${blue})`
  }

  return (
    <div className="bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-2">Environment-Application Throughput Heatmap</h2>
      <p className="text-slate-400 text-sm mb-4">Data volume intensity across environments and applications</p>

      {environments.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-slate-400">
          No data available
        </div>
      ) : (
        <div className="relative">
          {/* Simple Table Layout */}
          <div className="overflow-auto max-h-64 border border-slate-600 rounded-lg mb-8">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-700 bg-opacity-50">
                  <th className="sticky left-0 bg-slate-700 bg-opacity-50 p-3 text-left text-slate-300 font-medium border-r border-slate-500 border-opacity-50 z-10">
                    Environment
                  </th>
                  {allApps.map(app => (
                    <th
                      key={app}
                      className="p-2 text-center text-slate-300 font-medium border-r border-slate-500 border-opacity-50 min-w-16"
                      title={app}
                    >
                      <div className="transform -rotate-45 whitespace-nowrap">
                        {app.length > 6 ? `${app.substring(0, 6)}...` : app}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {environments.map(env => (
                  <tr key={env} className="border-b border-slate-600 border-opacity-30">
                    <td className="sticky left-0 bg-slate-700 bg-opacity-30 p-3 text-slate-300 font-medium border-r border-slate-500 border-opacity-50 z-10" title={env}>
                      {env.length > 12 ? `${env.substring(0, 12)}...` : env}
                    </td>
                    {allApps.map(app => {
                      const appData = heatmapData[env]?.[app]
                      const intensity = appData ? getIntensity(appData.volume) : 0
                      const color = getColor(intensity)
                      const cellKey = `${env}-${app}`

                      return (
                        <td
                          key={cellKey}
                          className="relative p-0 border-r border-slate-500 border-opacity-30 cursor-pointer"
                          onMouseEnter={() => setHoveredCell(cellKey)}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          <div
                            className="h-12 flex items-center justify-center transition-all duration-200 hover:brightness-110"
                            style={{ backgroundColor: color }}
                          >
                            {appData && intensity > 0.3 && (
                              <span className="text-white text-xs font-bold">
                                {formatBytes(appData.volume, 0)}
                              </span>
                            )}
                          </div>

                          {/* Tooltip */}
                          {hoveredCell === cellKey && appData && (
                            <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50 pointer-events-none">
                              <div className="bg-slate-900 p-3 rounded-lg border border-white border-opacity-20 text-xs whitespace-nowrap">
                                <p className="text-white font-semibold mb-1">{app}</p>
                                <p className="text-slate-400 mb-2">{env} • {appData.cluster}</p>
                                <div className="space-y-1">
                                  <p className="text-cyan-400">📊 Total: {formatBytes(appData.volume)}</p>
                                  <p className="text-green-400">� Protduced: {formatBytes(appData.produced)}</p>
                                  <p className="text-blue-400">� ConPsumed: {formatBytes(appData.consumed)}</p>
                                  <p className="text-purple-400">�  Active: {appData.activeDays} days</p>
                                </div>
                                {/* Arrow */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-slate-900"></div>
                              </div>
                            </div>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-white border-opacity-10">
            <div className="flex items-center space-x-4 text-xs">
              <span className="text-slate-300">Volume Intensity:</span>

              {/* Low Intensity */}
              <div
                className="relative flex items-center space-x-2 cursor-help"
                onMouseEnter={() => setHoveredLegend('low')}
                onMouseLeave={() => setHoveredLegend(null)}
              >
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getColor(0.2) }}></div>
                <span className="text-slate-400">Low</span>
                {hoveredLegend === 'low' && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 pointer-events-none">
                    <div className="bg-slate-900 p-2 rounded border border-white border-opacity-20 text-xs whitespace-nowrap">
                      <p className="text-white">Low Volume (0-33% of max)</p>
                      <p className="text-slate-400">≤ {formatBytes(maxVolume * 0.33)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Medium Intensity */}
              <div
                className="relative flex items-center space-x-2 cursor-help"
                onMouseEnter={() => setHoveredLegend('medium')}
                onMouseLeave={() => setHoveredLegend(null)}
              >
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getColor(0.6) }}></div>
                <span className="text-slate-400">Medium</span>
                {hoveredLegend === 'medium' && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 pointer-events-none">
                    <div className="bg-slate-900 p-2 rounded border border-white border-opacity-20 text-xs whitespace-nowrap">
                      <p className="text-white">Medium Volume (33-66% of max)</p>
                      <p className="text-slate-400">{formatBytes(maxVolume * 0.33)} - {formatBytes(maxVolume * 0.66)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* High Intensity */}
              <div
                className="relative flex items-center space-x-2 cursor-help"
                onMouseEnter={() => setHoveredLegend('high')}
                onMouseLeave={() => setHoveredLegend(null)}
              >
                <div className="w-4 h-4 rounded" style={{ backgroundColor: getColor(1.0) }}></div>
                <span className="text-slate-400">High</span>
                {hoveredLegend === 'high' && (
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50 pointer-events-none">
                    <div className="bg-slate-900 p-2 rounded border border-white border-opacity-20 text-xs whitespace-nowrap">
                      <p className="text-white">High Volume (66-100% of max)</p>
                      <p className="text-slate-400">{formatBytes(maxVolume * 0.66)} - {formatBytes(maxVolume)}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="text-xs text-slate-400">
              Max: {formatBytes(maxVolume)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}