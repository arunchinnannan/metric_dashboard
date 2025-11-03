export const formatBytes = (bytes) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A'
  try {
    const date = new Date(dateStr + 'T00:00:00Z')
    if (isNaN(date.getTime())) {
      // Try parsing without adding timezone
      const fallbackDate = new Date(dateStr)
      if (isNaN(fallbackDate.getTime())) return 'Invalid Date'
      return fallbackDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: '2-digit',
        year: 'numeric'
      })
    }
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: '2-digit',
      year: 'numeric'
    })
  } catch (error) {
    return 'Invalid Date'
  }
}

export const formatNumber = (num) => {
  return num.toLocaleString('en-US')
}
