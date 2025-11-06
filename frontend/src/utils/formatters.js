export const formatBytes = (bytes) => {
  // Handle undefined, null, empty string, or NaN values
  if (bytes === undefined || bytes === null || bytes === '' || isNaN(bytes)) {
    return '0 B'
  }
  
  // Convert to number if it's a string
  const numBytes = typeof bytes === 'string' ? parseFloat(bytes) : bytes
  
  // Handle zero or invalid numbers
  if (numBytes === 0 || isNaN(numBytes)) return '0 B'
  
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
  const i = Math.floor(Math.log(numBytes) / Math.log(k))
  return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
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
