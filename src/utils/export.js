import { utils, writeFile } from 'xlsx-js-style';

// Function to convert duration string to hours
const convertDurationToHours = (durationStr) => {
  if (!durationStr) return 0;
  
  const hoursMatch = durationStr.match(/(\d+(?:\.\d+)?)h/);
  const minutesMatch = durationStr.match(/(\d+(?:\.\d+)?)m/);
  
  const hours = hoursMatch ? parseFloat(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? parseFloat(minutesMatch[1]) : 0;
  
  return hours + (minutes / 60);
};

// Define centered style
const centeredStyle = {
  alignment: {
    horizontal: "center",
    vertical: "center"
  }
};

export const exportToExcelReport = (entries, schedules, shifts, filename, t) => {
  // Create a new workbook
  const wb = utils.book_new();

  // Combine entries and schedules into a single array with required fields
  const allRecords = [
    ...entries.map(entry => ({
      date: entry.date,
      name: entry.notes || t('reports.table.time_entry'),
      customHours: (entry.duration / 60).toFixed(1),
      timePeriod: `${entry.startTime}-${entry.endTime}`,
      type: t('reports.table.time_entry')
    })),
    ...schedules.map(schedule => {
      // Calculate custom hours using the same logic as in ReportPage.jsx
      let hours = 0;
      // Prioritize using custom duration saved in schedule record
      if (schedule.customDuration !== undefined && schedule.customDuration !== null && schedule.customDuration !== "") {
        hours = convertDurationToHours(schedule.customDuration);
      } else if (schedule.selectedShift) {
        const shift = shifts.find(s => s.id === schedule.selectedShift);
        // Modify logic: If custom duration exists (even if 0), use custom duration
        if (shift && shift.customDuration !== undefined && shift.customDuration !== null && shift.customDuration !== "") {
          hours = convertDurationToHours(shift.customDuration);
        } else {
          // Calculate duration from start and end time and convert to hours
          const start = new Date(`1970-01-01T${schedule.startTime}:00`);
          const end = new Date(`1970-01-01T${schedule.endTime}:00`);
          const durationInMinutes = (end - start) / (1000 * 60); // Convert to minutes
          hours = durationInMinutes / 60; // Convert to hours
        }
      }
      
      return {
        date: schedule.date,
        name: schedule.notes || schedule.title || '',
        customHours: hours.toFixed(1),
        timePeriod: `${schedule.startTime}-${schedule.endTime}`,
        type: t('reports.table.schedule')
      };
    })
  ];

  // Sort all records by date and start time
  const sortedRecords = [...allRecords].sort((a, b) => {
    // First sort by date
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    // If dates are equal, sort by time period (start time)
    return a.timePeriod.localeCompare(b.timePeriod);
  });

  // Add a summary row at the end
  const totalHours = sortedRecords.reduce((sum, record) => sum + parseFloat(record.customHours), 0);
  const summaryRow = {
    date: '',
    name: '',
    customHours: totalHours.toFixed(1),
    timePeriod: '',
    type: t('reports.total')
  };

  // Combine all records with the summary row
  const finalData = [...sortedRecords, summaryRow];

  // Format data for Excel with the required column names
  const formattedData = finalData.map(record => ({
    [t('reports.table.date')]: record.date,
    [t('reports.table.name')]: record.name,
    [t('reports.table.custom_hours')]: record.customHours,
    [t('reports.table.time_period')]: record.timePeriod,
    [t('reports.table.type')]: record.type
  }));

  // Create worksheet
  const ws = utils.json_to_sheet(formattedData);
  
  // Apply centered style to all cells in the worksheet
  const range = utils.decode_range(ws['!ref']);
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = utils.encode_cell({ r: row, c: col });
      if (ws[cellRef]) {
        ws[cellRef].s = centeredStyle;
      }
    }
  }
  
  // Add worksheet to workbook
  utils.book_append_sheet(wb, ws, t('reports.worksheet_name'));

  // Export to file
  writeFile(wb, `${filename}.xlsx`);
};