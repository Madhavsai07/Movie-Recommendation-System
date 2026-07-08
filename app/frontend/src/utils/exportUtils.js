/**
 * Trigger browser download of a JSON file.
 * 
 * @param {Array|Object} data - Content to download.
 * @param {string} filename - Output file name.
 */
export const downloadJSON = (data, filename = "recommendations.json") => {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Trigger browser download of a CSV file.
 * 
 * @param {Array} data - Flat objects array representing rows.
 * @param {string} filename - Output file name.
 */
export const downloadCSV = (data, filename = "recommendations.csv") => {
  if (!data || data.length === 0) return;
  
  // Get all header keys from first item
  const headers = Object.keys(data[0]);
  
  // Build header row
  const csvRows = [headers.join(",")];
  
  // Build data rows
  for (const row of data) {
    const values = headers.map((header) => {
      const val = row[header];
      // Escape commas, quotes, and newlines in text fields
      const strVal = val === undefined || val === null ? "" : String(val);
      const escaped = strVal.replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }
  
  const csvStr = csvRows.join("\n");
  const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
