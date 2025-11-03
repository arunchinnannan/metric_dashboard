import React, { useState, useEffect } from 'react'
import axios from 'axios'
import Header from './Header'
import FilterPanel from './FilterPanel'
import FilterBadges from './FilterBadges'
import MetricCards from './MetricCards'
import TimeSeriesChart from './TimeSeriesChart'
import TopApplicationsChart from './TopApplicationsChart'
import ProducerConsumerChart from './ProducerConsumerChart'
import ApplicationPerformanceChart from './ApplicationPerformanceChart'
import DataFlowTrendsChart from './DataFlowTrendsChart'
import ClusterChart from './ClusterChart'
import MotsGroupingChart from './MotsGroupingChart'
import MetricsTable from './MetricsTable'
import ExportButton from './ExportButton'

const API_URL = 'http://localhost:5000/api'

export default function Dashboard() {
  const [filters, setFilters] = useState({
    dateRange: { start: null, end: null },
    clusters: [],
    namespaces: [],
    environments: [],
    applications: [],
    poolIds: [],
    dataPlanes: [],
    motsIds: [],
  })

  const [filterOptions, setFilterOptions] = useState(null)
  const [filterOptionsLoading, setFilterOptionsLoading] = useState(false)
  const [data, setData] = useState({
    summary: null,
    timeSeries: [],
    topApps: [],
    envDist: [],
    clusterComp: [],
    namespaceDat: [],
    tableData: [],
    appPerformance: [],
    motsGrouping: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(new Date())

  useEffect(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    setFilters(prev => ({
      ...prev,
      dateRange: {
        start: thirtyDaysAgo.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      }
    }))
  }, [])

  useEffect(() => {
    const fetchOptions = async () => {
      setFilterOptionsLoading(true)
      try {
        // Send current date range to filter the dropdown options
        const dateRangeFilter = {
          dateRange: filters.dateRange
        }
        const res = await axios.post(`${API_URL}/filter-options`, { filters: dateRangeFilter })
        setFilterOptions(res.data)
      } catch (err) {
        console.error('Error fetching filter options:', err)
        setError('Failed to load filter options')
      } finally {
        setFilterOptionsLoading(false)
      }
    }
    
    // Only fetch options if we have a valid date range
    if (filters.dateRange.start && filters.dateRange.end) {
      fetchOptions()
    }
  }, [filters.dateRange.start, filters.dateRange.end])

  useEffect(() => {
    if (!filters.dateRange.start || !filters.dateRange.end) return

    const fetchData = async () => {
      setLoading(true)
      try {
        const [summary, timeSeries, topApps, envDist, clusterComp, namespaceDat, tableData, appPerformance, motsGrouping] = await Promise.all([
          axios.post(`${API_URL}/metrics-summary`, { filters }),
          axios.post(`${API_URL}/time-series`, { filters }),
          axios.post(`${API_URL}/top-applications`, { filters }),
          axios.post(`${API_URL}/environment-dist`, { filters }),
          axios.post(`${API_URL}/cluster-comparison`, { filters }),
          axios.post(`${API_URL}/namespace-data`, { filters }),
          axios.post(`${API_URL}/table-data`, { filters, page: 1, pageSize: 25 }),
          axios.post(`${API_URL}/application-performance`, { filters }),
          axios.post(`${API_URL}/mots-grouping`, { filters }),
        ])

        setData({
          summary: summary.data,
          timeSeries: timeSeries.data,
          topApps: topApps.data,
          envDist: envDist.data,
          clusterComp: clusterComp.data,
          namespaceDat: namespaceDat.data,
          tableData: tableData.data,
          appPerformance: appPerformance.data,
          motsGrouping: motsGrouping.data,
        })
        setLastUpdate(new Date())
        setError(null)
      } catch (err) {
        console.error('Error fetching data:', err)
        setError('Failed to fetch data. Check console for details.')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [filters])

  const handleFilterChange = (newFilters) => {
    // Check if date range has changed
    const dateRangeChanged = 
      newFilters.dateRange.start !== filters.dateRange.start ||
      newFilters.dateRange.end !== filters.dateRange.end

    // If date range changed, clear other filters since available options will change
    if (dateRangeChanged) {
      setFilters({
        ...newFilters,
        clusters: [],
        namespaces: [],
        environments: [],
        applications: [],
        poolIds: [],
        dataPlanes: [],
        motsIds: [],
      })
    } else {
      setFilters(newFilters)
    }
  }

  const handleResetFilters = () => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    
    setFilters({
      dateRange: {
        start: thirtyDaysAgo.toISOString().split('T')[0],
        end: today.toISOString().split('T')[0]
      },
      clusters: [],
      namespaces: [],
      environments: [],
      applications: [],
      poolIds: [],
      dataPlanes: [],
      motsIds: [],
    })
  }

  if (!filterOptions) {
    return <div className="p-8 text-white">Loading dashboard...</div>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-900 to-slate-950">
      <Header onRefresh={() => window.location.reload()} lastUpdate={lastUpdate} loading={loading} />
      
      <FilterPanel 
        filterOptions={filterOptions}
        filterOptionsLoading={filterOptionsLoading}
        filters={filters}
        onFilterChange={handleFilterChange}
        onResetFilters={handleResetFilters}
      />

      <main className="pt-20 pl-80 pr-6 pb-6 min-h-screen">
        <div className="p-6">
          {error && (
            <div className="bg-red-500 text-white p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <FilterBadges filters={filters} />

          {loading && (
            <div className="fixed top-20 left-0 right-0 h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 animate-pulse z-30"></div>
          )}

          <div className="space-y-6">
            <MetricCards summary={data.summary} loading={loading} />
            <TimeSeriesChart data={data.timeSeries} loading={loading} />
            
            <div className="grid grid-cols-1 gap-6">
              <MotsGroupingChart data={data.motsGrouping} loading={loading} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ProducerConsumerChart data={data.topApps} loading={loading} />
              <ApplicationPerformanceChart data={data.appPerformance} loading={loading} />
            </div>

            <div className="grid grid-cols-1 gap-6">
              <DataFlowTrendsChart data={data.timeSeries} loading={loading} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TopApplicationsChart data={data.topApps} loading={loading} />
              <ClusterChart data={data.clusterComp} loading={loading} />
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Detailed Data</h2>
                <ExportButton tableData={data.tableData} allData={data} />
              </div>
              <MetricsTable data={data.tableData} loading={loading} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
