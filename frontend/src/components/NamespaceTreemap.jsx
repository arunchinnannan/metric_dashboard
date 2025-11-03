import React from 'react'
import { Treemap, Tooltip, ResponsiveContainer } from 'recharts'
import { formatBytes } from '../utils/formatters'

export default function NamespaceTreemap({ data, loading }) {
  if (loading) {
    return (
      <div className="bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 rounded-xl p-6 h-80 animate-pulse">
        <div className="h-full bg-slate-800 bg-opacity-30 rounded-lg"></div>
      </div>
    )
  }

  const chartData = [
    {
      name: 'Namespaces',
      children: data.map((d, idx) => ({
        name: d.namespace,
        size: parseInt(d.total_bytes),
        fill: `hsl(${(idx * 360 / data.length) % 360}, 70%, 60%)`
      }))
    }
  ]

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length && payload[0].payload.size) {
      return (
        <div className="bg-slate-900 p-3 rounded border border-white border-opacity-20">
          <p className="text-white text-sm font-semibold">{payload[0].payload.name}</p>
          <p className="text-cyan-400 text-sm">{formatBytes(payload[0].payload.size)}</p>
        </div>
      )
    }
    return null
  }

  const renderCustomizedContent = (props) => {
    const { x, y, width, height, name, size } = props
    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          style={{
            fill: props.fill || '#3b82f6',
            stroke: 'rgba(255,255,255,0.1)',
            strokeWidth: 2,
          }}
        />
        {width > 50 && height > 30 && (
          <>
            <text x={x + width / 2} y={y + height / 2} textAnchor="middle" fill="white" fontSize={12} fontWeight="bold">
              {name}
            </text>
            <text x={x + width / 2} y={y + height / 2 + 16} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize={10}>
              {formatBytes(size)}
            </text>
          </>
        )}
      </g>
    )
  }

  return (
    <div className="bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 rounded-xl p-6">
      <h2 className="text-lg font-semibold text-white mb-4">Namespace Data Usage Hierarchy</h2>
      
      {data.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-slate-400">
          No data available
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={350}>
          <Treemap
            data={chartData}
            dataKey="size"
            stroke="#fff"
            fill="#8884d8"
            content={renderCustomizedContent}
          >
            <Tooltip content={<CustomTooltip />} />
          </Treemap>
        </ResponsiveContainer>
      )}
    </div>
  )
}
