export const jsonToCsv = (data: any[]): string => {
  if (!data || !data.length) return "";

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Format headers
  const csvRows = [headers.join(",")];

  // Format rows
  for (const row of data) {
    const values = headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) {
        val = "";
      } else if (typeof val === "object") {
        // Flatten simple objects (like user: {name: '...'})
        val = JSON.stringify(val).replace(/"/g, '""');
      } else {
        val = String(val).replace(/"/g, '""');
      }
      
      // Escape commas and newlines
      if (val.includes(",") || val.includes("\\n") || val.includes('"')) {
        return `"${val}"`;
      }
      return val;
    });
    
    csvRows.push(values.join(","));
  }

  return csvRows.join("\n");
};
