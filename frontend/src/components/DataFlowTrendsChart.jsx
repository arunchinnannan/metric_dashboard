import React from 'react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatBytes, formatDate } from '../utils/formatters'

export default function DataFlowTrendsChart({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 rounded-xl p-6 h-80 animate-pulse">
        <div className="h-full bg-slate-800 bg-opacity-30 rounded-lg"></div>
      </div>
    )
  }

  // Transform time series data to show stacked areas
  const chartData = data.map(d => ({
    date: d.metric_date,
    dateFormatted: formatDate(d.metric_date),
    produced: parseInt(d.produced) || 0,
    consumed: parseInt(d.consumed) || 0,
    netFlow: (parseInt(d.produced) || 0) - (parseInt(d.consumed) || 0)
  })).sort((a, b) => new Date(a.date) - new Date(b.date))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      const data = payload[0].payload
      return (
        <div className="bg-slate-900 p-4 rounded-lg border border-white border-opacity-20">
          <p className="text-white text-sm font-semibold mb-2">{formatDate(label)}</p>
          <div className="space-y-1">
            <p className="text-green-400 text-sm">
              📤 Produced: {formatBytes(data.produced)}
            </p>
            <p className="text-blue-400 text-sm">
              📥 Consumed: {formatBytes(data.consumed)}
            </p>
            <p className={`text-sm ${data.netFlow >= 0 ? 'text-yellow-400' : 'text-red-400'}`}>
              📊 Net Flow: {data.netFlow >= 0 ? '+' : ''}{formatBytes(Math.abs(data.netFlow))}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-2">Data Flow Trends Over Time</h2>
      <p className="text-slate-400 text-sm mb-4">Producer and Consumer traffic patterns</p>
      
      {chartData.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-slate-400">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="producedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
              </linearGradient>
              <linearGradient id="consumedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.1}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="date"
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(value) => formatDate(value)}
            />
            <YAxis 
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(value) => formatBytes(value)}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              wrapperStyle={{ color: '#e2e8f0', fontSize: '12px' }}
            />
            <Area
              type="monotone"
              dataKey="produced"
              stackId="1"
              stroke="#10b981"
              fill="url(#producedGradient)"
              name="Produced Data"
            />
            <Area
              type="monotone"
              dataKey="consumed"
              stackId="2"
              stroke="#3b82f6"
              fill="url(#consumedGradient)"
              name="Consumed Data"
            />
          </AreaChart>
        </ResponsiveContainer>
      )}
      
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white border-opacity-10">
        <div className="text-center">
          <p className="text-green-400 text-lg font-semibold">
            {formatBytes(chartData.reduce((sum, d) => sum + d.produced, 0))}
          </p>
          <p className="text-slate-400 text-xs">Total Produced</p>
        </div>
        <div className="text-center">
          <p className="text-blue-400 text-lg font-semibold">
            {formatBytes(chartData.reduce((sum, d) => sum + d.consumed, 0))}
          </p>
          <p className="text-slate-400 text-xs">Total Consumed</p>
        </div>
        <div className="text-center">
          <p className="text-yellow-400 text-lg font-semibold">
            {chartData.length > 0 ? 
              ((chartData.reduce((sum, d) => sum + d.consumed, 0) / 
                chartData.reduce((sum, d) => sum + d.produced, 0)) * 100).toFixed(1) + '%'
              : '0%'
            }
          </p>
          <p className="text-slate-400 text-xs">Consumption Rate</p>
        </div>
      </div>
    </div>
  )
}