/**
 * Date utilities for handling timezone and formatting
 */

// Get current timestamp in UTC
export function getCurrentUTCTimestamp(): Date {
  return new Date();
}

// Get current timestamp in Thailand timezone (UTC+7)
export function getCurrentThailandTime(): Date {
  const now = new Date();
  const thailandOffset = 7 * 60; // UTC+7 in minutes
  const utc = now.getTime() + (now.getTimezoneOffset() * 60000);
  return new Date(utc + (thailandOffset * 60000));
}

// Convert UTC date to Thailand timezone
export function utcToThailand(utcDate: Date): Date {
  const thailandOffset = 7 * 60; // UTC+7 in minutes
  const utc = utcDate.getTime() + (utcDate.getTimezoneOffset() * 60000);
  return new Date(utc + (thailandOffset * 60000));
}

// Format date for database (ISO string)
export function formatForDatabase(date: Date = new Date()): string {
  return date.toISOString();
}

// Format date for display in Thai format
export function formatForDisplay(date: Date | string, includeTime: boolean = true): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Bangkok'
  };

  if (includeTime) {
    options.hour = '2-digit';
    options.minute = '2-digit';
    options.second = '2-digit';
    options.hour12 = false;
  }

  return new Intl.DateTimeFormat('th-TH', options).format(dateObj);
}

// Get timestamp for created_at field (เวลาไทย)
export function getCreatedAtTimestamp(): string {
  const now = new Date();
  const thailandTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Bangkok"}));
  return thailandTime.toISOString();
}

// Parse database timestamp and display in local time
export function parseAndDisplayTimestamp(dbTimestamp: string): string {
  const date = new Date(dbTimestamp);
  return formatForDisplay(date);
}

// Check if date is today
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return dateObj.getFullYear() === today.getFullYear() &&
         dateObj.getMonth() === today.getMonth() &&
         dateObj.getDate() === today.getDate();
}

// Format date for UI display (Thai locale with Bangkok timezone)
// Safe for SSR/Hydration by using predictable formatting
export function formatDateForUI(dateString: string | Date, options?: {
  includeTime?: boolean;
  locale?: string;
}): string {
  if (!dateString) return '';
  
  try {
    const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return typeof dateString === 'string' ? dateString : '';
    }
    
    const { includeTime = false } = options || {};
    
    // Use predictable formatting to avoid hydration mismatches
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    
    let result = `${day}/${month}/${year}`;
    
    if (includeTime) {
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      result += ` ${hours}:${minutes}`;
    }
    
    return result;
  } catch {
    // Fallback to original string if parsing fails
    return typeof dateString === 'string' ? dateString : '';
  }
}