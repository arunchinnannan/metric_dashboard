import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import { formatBytes } from '../utils/formatters'

export default function ProducerConsumerChart({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 rounded-xl p-6 h-80 animate-pulse">
        <div className="h-full bg-slate-800 bg-opacity-30 rounded-lg"></div>
      </div>
    )
  }

  // Transform data to show producer vs consumer patterns
  const chartData = data.slice(0, 8).map(d => ({
    name: d.application_name || 'Unknown',
    produced: parseInt(d.produced || d.total_produced) || 0,
    consumed: parseInt(d.consumed || d.total_consumed) || 0,
    ratio: parseInt(d.produced || d.total_produced) > 0 ? 
      (parseInt(d.consumed || d.total_consumed) / parseInt(d.produced || d.total_produced)).toFixed(2) : 0
  })).filter(d => d.produced > 0 || d.consumed > 0)

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('ProducerConsumerChart - Items:', chartData.length)
    if (chartData.length > 0) {
      console.log('ProducerConsumerChart - Sample:', {
        name: chartData[0].name,
        produced: chartData[0].produced,
        consumed: chartData[0].consumed
      })
    }
  }

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
      <h2 className="text-lg font-semibold text-white mb-4">Producer vs Consumer Traffic</h2>
      
      {chartData.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-slate-400">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis 
              dataKey="name" 
              stroke="#9ca3af"
              fontSize={12}
              angle={-45}
              textAnchor="end"
              height={80}
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
            <Legend 
              wrapperStyle={{ color: '#e2e8f0', fontSize: '12px' }}
            />
            <Bar 
              dataKey="produced" 
              fill="#10b981"
              name="Produced Data"
              radius={[2, 2, 0, 0]}
            />
            <Bar 
              dataKey="consumed" 
              fill="#3b82f6"
              name="Consumed Data"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}