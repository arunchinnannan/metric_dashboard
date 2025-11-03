import React from 'react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { formatBytes, formatDate } from '../utils/formatters'

export default function TimeSeriesChart({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 rounded-xl p-6 h-96 animate-pulse">
        <div className="h-full bg-slate-800 bg-opacity-30 rounded-lg"></div>
      </div>
    )
  }

  const chartData = data.map(d => ({
    ...d,
    consumed: parseInt(d.consumed),
    produced: parseInt(d.produced)
  }))

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      return (
        <div className="bg-slate-900 p-2 rounded border border-white border-opacity-20 text-xs">
          <p className="text-white font-semibold mb-1">{formatDate(payload[0]?.payload?.metric_date)}</p>
          {payload.map((entry, idx) => (
            <p key={idx} style={{ color: entry.color }}>
              {entry.name}: {formatBytes(entry.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 rounded-xl p-6 mb-6">
      <h2 className="text-lg font-semibold text-white mb-4">Kafka Traffic Over Time</h2>
      
      {chartData.length === 0 ? (
        <div className="h-96 flex items-center justify-center text-slate-400">
          No data available for selected filters
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
            <XAxis 
              dataKey="metric_date" 
              stroke="rgba(255,255,255,0.5)" 
              tickFormatter={(value) => formatDate(value)}
            />
            <YAxis stroke="rgba(255,255,255,0.5)" tickFormatter={(val) => formatBytes(val)} />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ stroke: 'rgba(255, 255, 255, 0.2)', strokeWidth: 1 }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="consumed" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={false}
              name="Consumed Bytes"
            />
            <Line 
              type="monotone" 
              dataKey="produced" 
              stroke="#a855f7" 
              strokeWidth={2}
              dot={false}
              name="Produced Bytes"
            />
          </LineChart>
        </ResponsiveContainer>
      )}
    </div>
  )
}
