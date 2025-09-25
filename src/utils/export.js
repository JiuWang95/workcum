import { utils, writeFile } from 'xlsx';

export const exportToExcel = (data, filename) => {
  // Format data for Excel
  const formattedData = data.map(entry => {
    return {
      Date: entry.date,
      'Start Time': entry.startTime,
      'End Time': entry.endTime,
      Duration: `${(entry.duration / 60).toFixed(1)}h`,
      Minutes: entry.duration,
      Notes: entry.notes || ''
    };
  });

  // Create worksheet
  const ws = utils.json_to_sheet(formattedData);

  // Create workbook
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, 'Time Entries');

  // Export to file
  writeFile(wb, `${filename}.xlsx`);
};