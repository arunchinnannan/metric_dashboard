import React from 'react'
import { formatBytes, formatNumber } from '../utils/formatters'

export default function MetricCards({ summary, loading }) {
  const SkeletonLoader = () => (
    <div className="h-24 bg-slate-800 bg-opacity-30 rounded-lg animate-pulse"></div>
  )

  const Card = ({ title, value, icon }) => (
    <div className="bg-white bg-opacity-5 backdrop-blur-xl border border-white border-opacity-10 rounded-xl p-6 hover:bg-opacity-10 hover:shadow-xl transition-all">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-400 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-white mt-2">{value}</p>
        </div>
        <span className="text-4xl opacity-50">{icon}</span>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {[1, 2, 3, 4].map(i => <SkeletonLoader key={i} />)}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      <Card 
        title="Total Consumed" 
        value={summary ? formatBytes(summary.total_consumed) : '0 B'}
        icon="📥"
      />
      <Card 
        title="Total Produced" 
        value={summary ? formatBytes(summary.total_produced) : '0 B'}
        icon="📤"
      />
      <Card 
        title="Active Applications" 
        value={summary ? formatNumber(summary.active_applications) : '0'}
        icon="🚀"
      />
      <Card 
        title="Active Clusters" 
        value={summary ? formatNumber(summary.active_clusters) : '0'}
        icon="🌐"
      />
    </div>
  )
}
