/**
 * Date formatting utilities that prevent hydration mismatches
 */

export const formatDate = (dateString: string, options?: {
  format?: 'long' | 'short' | 'numeric'
}) => {
  const { format = 'long' } = options || {}
  
  // ป้องกัน hydration mismatch โดยใช้ client-side rendering สำหรับ date
  if (typeof window === 'undefined') {
    // Server-side: return simple ISO format
    return new Date(dateString).toISOString().split('T')[0]
  }
  
  // Client-side: return localized format
  const dateOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    day: 'numeric'
  }
  
  switch (format) {
    case 'short':
      dateOptions.month = 'short'
      break
    case 'numeric':
      dateOptions.month = 'numeric'
      break
    case 'long':
    default:
      dateOptions.month = 'long'
      break
  }
  
  return new Date(dateString).toLocaleDateString('th-TH', dateOptions)
}

export const formatDateTime = (dateString: string) => {
  if (typeof window === 'undefined') {
    // Server-side: return simple ISO format
    return new Date(dateString).toISOString().replace('T', ' ').slice(0, 19)
  }
  
  // Client-side: return localized format
  return new Date(dateString).toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}
