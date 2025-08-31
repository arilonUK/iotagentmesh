
/**
 * Utility functions for exporting data in different formats
 */

/**
 * Convert data to CSV format
 */
export function dataToCSV<T extends Record<string, unknown>>(data: T[]): string {
  if (data.length === 0) {
    return '';
  }
  
  // Get headers from the first object's keys
  const headers = Object.keys(data[0]);
  const csvRows = [];
  
  // Add headers row
  csvRows.push(headers.join(','));
  
  // Add data rows
  for (const row of data) {
    const values = headers.map(header => {
      const value = row[header];
      // Handle different data types
      if (value === null || value === undefined) {
        return '';
      } else if (typeof value === 'string') {
        // Escape quotes and wrap in quotes
        return `"${value.replace(/"/g, '""')}"`;
      } else if (typeof value === 'object') {
        // Convert objects (including Date) to string
        return `"${JSON.stringify(value)}"`;
      } else {
        return String(value);
      }
    });
    csvRows.push(values.join(','));
  }
  
  return csvRows.join('\n');
}

/**
 * Convert data to JSON format
 */
export function dataToJSON<T extends Record<string, unknown>>(data: T[]): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Download data as a file
 */
export function downloadFile(data: string, filename: string, mimeType: string): void {
  const blob = new Blob([data], { type: mimeType });
  const url = URL.createObjectURL(blob);
  
  // Create a download link and trigger it
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Download data as CSV file
 */
export function downloadCSV<T extends Record<string, unknown>>(data: T[], filename: string = 'export.csv'): void {
  const csvData = dataToCSV(data);
  downloadFile(csvData, filename, 'text/csv');
}

/**
 * Download data as JSON file
 */
export function downloadJSON<T extends Record<string, unknown>>(data: T[], filename: string = 'export.json'): void {
  const jsonData = dataToJSON(data);
  downloadFile(jsonData, filename, 'application/json');
}
