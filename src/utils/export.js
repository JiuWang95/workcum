import { utils, writeFile } from 'xlsx';

export const exportToExcel = (data, filename) => {
  // Format data for Excel
  const formattedData = data.map(entry => {
    const hours = Math.floor(entry.duration / 60);
    const minutes = entry.duration % 60;
    return {
      Date: entry.date,
      'Start Time': entry.startTime,
      'End Time': entry.endTime,
      Duration: `${hours}h ${minutes}m`,
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