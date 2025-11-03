import React from 'react'

export default function Header({ onRefresh, lastUpdate, loading }) {
  const formatTime = (date) => {
    return date.toLocaleString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 backdrop-blur-xl border-b border-white border-opacity-10 z-50">
      <div className="h-full px-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">📊 Application Metrics Dashboard</h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-sm text-slate-400">
            Last updated: {formatTime(lastUpdate)}
          </div>
          
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition-all ${
              loading ? 'opacity-50 cursor-not-allowed animate-spin' : 'hover:shadow-lg'
            }`}
          >
            🔄 Refresh
          </button>
        </div>
      </div>
    </header>
  )
}
