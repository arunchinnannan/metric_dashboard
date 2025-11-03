import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatBytes } from '../utils/formatters'

export default function TopApplicationsChart({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 rounded-xl p-6 h-80 animate-pulse">
        <div className="h-full bg-slate-800 bg-opacity-30 rounded-lg"></div>
      </div>
    )
  }

  const chartData = data.map(d => ({
    ...d,
    consumed: parseInt(d.consumed),
    produced: parseInt(d.produced)
  })).sort((a, b) => (b.consumed + b.produced) - (a.consumed + a.produced))

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-slate-900 p-2 rounded border border-white border-opacity-20 text-xs">
          <p className="text-white font-semibold mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.fill }}>
              {entry.name}: {formatBytes(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Top 10 Applications by Data Usage</h2>
      
      {chartData.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-slate-400">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} layout="vertical" margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              type="number" 
              stroke="#9ca3af"
              fontSize={12}
              tickFormatter={(value) => formatBytes(value)} 
            />
            <YAxis 
              type="category" 
              dataKey="application_name" 
              stroke="#9ca3af"
              fontSize={12}
              width={120} 
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
            />
            <Legend 
              wrapperStyle={{ color: '#e2e8f0', fontSize: '12px' }}
            />
            <Bar 
              dataKey="consumed" 
              stackId="a" 
              fill="#3b82f6" 
              name="Consumed"
              radius={[0, 2, 2, 0]}
            />
            <Bar 
              dataKey="produced" 
              stackId="a" 
              fill="#10b981" 
              name="Produced"
              radius={[0, 2, 2, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
