import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { formatBytes } from '../utils/formatters'

export default function MotsGroupingChart({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 rounded-xl p-6 h-80 animate-pulse">
        <div className="h-full bg-slate-800 bg-opacity-30 rounded-lg"></div>
      </div>
    )
  }

  // Define colors first
  const COLORS = [
    '#06b6d4', '#3b82f6', '#a855f7', '#ec4899', 
    '#f59e0b', '#10b981', '#ef4444', '#8b5cf6',
    '#f97316', '#84cc16', '#06b6d4', '#6366f1'
  ]

  // Group applications by MOTS ID and calculate totals
  const motsGroups = Array.isArray(data) ? data.reduce((acc, app) => {
    if (!app || typeof app !== 'object') return acc
    
    const motsId = app.mots_id || 'Unknown MOTS'
    const totalVolume = (parseInt(app.total_produced) || 0) + (parseInt(app.total_consumed) || 0)
    
    // Skip entries with no volume
    if (totalVolume <= 0) return acc
    
    if (!acc[motsId]) {
      acc[motsId] = {
        name: motsId,
        value: 0,
        applications: [],
        appCount: 0
      }
    }
    
    acc[motsId].value += totalVolume
    acc[motsId].appCount += 1
    acc[motsId].applications.push({
      name: app.application_name || 'Unknown App',
      value: totalVolume,
      environment: app.environment || 'Unknown',
      cluster: app.cluster_name || 'Unknown',
      produced: parseInt(app.total_produced) || 0,
      consumed: parseInt(app.total_consumed) || 0
    })
    
    return acc
  }, {}) : {}

  // Convert to chart format and sort by value
  const chartData = Object.values(motsGroups)
    .filter(mots => mots && mots.value > 0) // Filter out invalid entries
    .sort((a, b) => b.value - a.value)
    .slice(0, 10) // Show top 10 MOTS IDs
    .map((mots, index) => ({
      name: mots.name.length > 20 ? `${mots.name.substring(0, 17)}...` : mots.name,
      fullName: mots.name,
      value: mots.value,
      appCount: mots.appCount,
      applications: mots.applications,
      color: COLORS[index % COLORS.length]
    }))

  // Debug logging (can be removed in production)
  if (process.env.NODE_ENV === 'development') {
    console.log('MotsGroupingChart - Chart data length:', chartData.length)
    if (chartData.length > 0) {
      console.log('MotsGroupingChart - First item color:', chartData[0].color)
      console.log('MotsGroupingChart - Available colors:', COLORS.slice(0, 3))
    }
  }

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const data = payload[0].payload
      
      return (
        <div className="bg-slate-900 p-2 rounded border border-white border-opacity-20 text-xs">
          <p className="text-white font-semibold">{data.fullName}</p>
          <p className="text-slate-300">Volume: {formatBytes(data.value)}</p>
          <p className="text-blue-400">Apps: {data.appCount}</p>
        </div>
      )
    }
    return null
  }



  return (
    <div className="bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-2">MOTS ID Application Grouping</h2>
      <p className="text-slate-400 text-sm mb-4">Applications organized by MOTS ID (size = data volume)</p>
      
      {chartData.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-slate-400">
          <div className="text-center">
            <p className="text-lg mb-2">📊</p>
            <p>No MOTS data available</p>
            <p className="text-xs mt-2">Try adjusting your date range or filters</p>
          </div>
        </div>
      ) : (
        <div className="relative">
          <ResponsiveContainer width="100%" height={250}>
            <BarChart 
              data={chartData} 
              margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="name"
                stroke="#9ca3af"
                fontSize={12}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => formatBytes(value)}
              />
              <Tooltip 
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
              />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
      
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white border-opacity-10">
        <div className="text-center">
          <p className="text-cyan-400 text-lg font-semibold">
            {Object.keys(motsGroups).length}
          </p>
          <p className="text-slate-400 text-xs">Total MOTS IDs</p>
        </div>
        <div className="text-center">
          <p className="text-green-400 text-lg font-semibold">
            {Object.values(motsGroups).reduce((sum, mots) => sum + mots.appCount, 0)}
          </p>
          <p className="text-slate-400 text-xs">Total Applications</p>
        </div>
        <div className="text-center">
          <p className="text-yellow-400 text-lg font-semibold">
            {Object.values(motsGroups).length > 0 ? 
              (Object.values(motsGroups).reduce((sum, mots) => sum + mots.appCount, 0) / 
               Object.keys(motsGroups).length).toFixed(1)
              : '0'
            }
          </p>
          <p className="text-slate-400 text-xs">Avg Apps/MOTS</p>
        </div>
      </div>
    </div>
  )
}