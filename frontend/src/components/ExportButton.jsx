import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { formatBytes } from '../utils/formatters'

export default function ExportButton({ tableData, allData }) {
  const handleCSVExport = () => {
    if (!tableData?.data || tableData.data.length === 0) {
      alert('No data to export')
      return
    }

    const csvData = tableData.data.map(row => ({
      'Date': row.metric_date,
      'Cluster': row.cluster_name,
      'Namespace': row.namespace,
      'Application': row.application_name || '-',
      'Environment': row.environment || '-',
      'Consumed Bytes': row.consumedbytes,
      'Produced Bytes': row.producedbytes,
    }))

    const csv = Papa.unparse(csvData)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `kafka_metrics_${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  const handleExcelExport = () => {
    if (!tableData?.data || tableData.data.length === 0) {
      alert('No data to export')
      return
    }

    const workbook = XLSX.utils.book_new()

    // Sheet 1: Summary
    const summaryData = [
      ['Metric', 'Value'],
      ['Total Consumed Bytes', formatBytes(allData.summary?.total_consumed || 0)],
      ['Total Produced Bytes', formatBytes(allData.summary?.total_produced || 0)],
      ['Active Applications', allData.summary?.active_applications || 0],
      ['Active Clusters', allData.summary?.active_clusters || 0],
      ['Export Date', new Date().toLocaleString()],
    ]
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData)
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary')

    // Sheet 2: Time Series
    const timeSeriesData = allData.timeSeries.map(row => ({
      'Date': row.metric_date,
      'Consumed Bytes': row.consumed,
      'Produced Bytes': row.produced,
    }))
    const timeSeriesSheet = XLSX.utils.json_to_sheet(timeSeriesData)
    XLSX.utils.book_append_sheet(workbook, timeSeriesSheet, 'Time Series')

    // Sheet 3: Full Data
    const fullData = tableData.data.map(row => ({
      'Date': row.metric_date,
      'Cluster': row.cluster_name,
      'Namespace': row.namespace,
      'Application': row.application_name || '-',
      'Environment': row.environment || '-',
      'Consumed Bytes': row.consumedbytes,
      'Produced Bytes': row.producedbytes,
      'Pool ID': row.pool_id,
      'Data Plane': row.data_plane || '-',
      'MOTS ID': row.mots_id || '-',
    }))
    const fullDataSheet = XLSX.utils.json_to_sheet(fullData)
    XLSX.utils.book_append_sheet(workbook, fullDataSheet, 'Full Data')

    XLSX.writeFile(workbook, `kafka_metrics_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <div className="flex gap-3">
      <button
        onClick={handleCSVExport}
        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
      >
        📥 CSV
      </button>
      <button
        onClick={handleExcelExport}
        className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-all"
      >
        📊 Excel
      </button>
    </div>
  )
}
