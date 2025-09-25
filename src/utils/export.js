import { utils, writeFile } from 'xlsx';

// Function to convert duration string to hours
const convertDurationToHours = (durationStr) => {
  if (!durationStr) return 0;
  
  const hoursMatch = durationStr.match(/(\d+(?:\.\d+)?)h/);
  const minutesMatch = durationStr.match(/(\d+(?:\.\d+)?)m/);
  
  const hours = hoursMatch ? parseFloat(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? parseFloat(minutesMatch[1]) : 0;
  
  return hours + (minutes / 60);
};

export const exportToExcel = (entries, schedules, shifts, filename) => {
  // Format time entries data for Excel
  const formattedEntries = entries.map(entry => {
    return {
      Type: '工时记录',
      Date: entry.date,
      'Start Time': entry.startTime,
      'End Time': entry.endTime,
      Duration: `${(entry.duration / 60).toFixed(1)}h`,
      Minutes: entry.duration,
      Notes: entry.notes || ''
    };
  });

  // Format schedules data for Excel
  const formattedSchedules = schedules.map(schedule => {
    let duration = 0;
    if (schedule.selectedShift) {
      const shift = shifts.find(s => s.id === schedule.selectedShift);
      if (shift && shift.customDuration) {
        duration = convertDurationToHours(shift.customDuration) * 60;
      } else {
        // Calculate duration from start and end time
        const start = new Date(`1970-01-01T${schedule.startTime}:00`);
        const end = new Date(`1970-01-01T${schedule.endTime}:00`);
        duration = (end - start) / (1000 * 60); // Convert to minutes
      }
    }
    
    return {
      Type: '排班',
      Date: schedule.date,
      'Start Time': schedule.startTime,
      'End Time': schedule.endTime,
      Duration: `${(duration / 60).toFixed(1)}h`,
      Minutes: duration,
      Notes: schedule.notes || schedule.title || ''
    };
  });

  // Combine both types of data
  const combinedData = [...formattedEntries, ...formattedSchedules];

  // Create worksheet
  const ws = utils.json_to_sheet(combinedData);

  // Create workbook
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, '工时记录');

  // Export to file
  writeFile(wb, `${filename}.xlsx`);
};