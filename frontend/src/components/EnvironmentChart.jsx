import React from 'react'
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts'
import { formatBytes } from '../utils/formatters'

export default function EnvironmentChart({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 rounded-xl p-6 h-80 animate-pulse">
        <div className="h-full bg-slate-800 bg-opacity-30 rounded-lg"></div>
      </div>
    )
  }

  const chartData = data.map(d => ({
    ...d,
    environment: d.environment || 'Unknown',
    total_bytes: parseInt(d.total_bytes)
  })).filter(d => d.total_bytes > 0)

  const COLORS = ['#06b6d4', '#3b82f6', '#a855f7', '#ec4899', '#f59e0b', '#10b981']

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const data = payload[0].payload
      const total = chartData.reduce((sum, item) => sum + item.total_bytes, 0)
      const percentage = ((payload[0].value / total) * 100).toFixed(1)
      return (
        <div className="bg-slate-900 p-3 rounded border border-white border-opacity-20">
          <p className="text-white text-sm font-semibold">{data.environment || 'Unknown Environment'}</p>
          <p className="text-slate-300 text-sm">{formatBytes(payload[0].value)}</p>
          <p className="text-cyan-400 text-sm">{percentage}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Data Distribution by Environment</h2>
      
      {chartData.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-slate-400">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={380}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="total_bytes"
              nameKey="environment"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={50}
              wrapperStyle={{
                paddingTop: '20px',
                fontSize: '12px',
                color: '#e2e8f0'
              }}
              formatter={(value, entry) => (
                <span style={{ color: '#e2e8f0', fontSize: '12px' }}>
                  {value || 'Unknown'}
                </span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
