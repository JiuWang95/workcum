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

  // Sort entries by date and start time
  const sortedEntries = [...entries].sort((a, b) => {
    // First sort by date
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    // If dates are equal, sort by start time
    return a.startTime.localeCompare(b.startTime);
  });

  // 1. Format time entries data for Excel
  const formattedEntries = sortedEntries.map(entry => {
    return {
        Type: t ? t('reports.table.time_entry') : t('reports.table.time_entry'),
        Date: entry.date,
        'Start Time': entry.startTime,
        'End Time': entry.endTime,
        Duration: `${(entry.duration / 60).toFixed(1)}h`,
        Minutes: entry.duration,
        Notes: entry.notes || ''
      };
  });

  // Add time entries worksheet if there are entries
  if (formattedEntries.length > 0) {
    const wsEntries = utils.json_to_sheet(formattedEntries);
    
    // Apply centered style to all cells in the worksheet
    const range = utils.decode_range(wsEntries['!ref']);
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = utils.encode_cell({ r: row, c: col });
        if (wsEntries[cellRef]) {
          wsEntries[cellRef].s = centeredStyle;
        }
      }
    }
    
    utils.book_append_sheet(wb, wsEntries, t ? t('reports.table.time_entry') : t('reports.table.time_entry'));
  }

  // Sort schedules by date and start time
  const sortedSchedules = [...schedules].sort((a, b) => {
    // First sort by date
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    // If dates are equal, sort by start time
    return a.startTime.localeCompare(b.startTime);
  });

  // 2. Format schedules data for Excel
  const formattedSchedules = sortedSchedules.map(schedule => {
    let duration = 0;
    // Prioritize using custom duration saved in schedule record
    if (schedule.customDuration !== undefined && schedule.customDuration !== null && schedule.customDuration !== "") {
      duration = convertDurationToHours(schedule.customDuration) * 60;
    } else if (schedule.selectedShift) {
      const shift = shifts.find(s => s.id === schedule.selectedShift);
      // Modify logic: If custom duration exists (even if 0), use custom duration
      if (shift && shift.customDuration !== undefined && shift.customDuration !== null && shift.customDuration !== "") {
        duration = convertDurationToHours(shift.customDuration) * 60;
      } else {
        // Calculate duration from start and end time
        const start = new Date(`1970-01-01T${schedule.startTime}:00`);
        const end = new Date(`1970-01-01T${schedule.endTime}:00`);
        duration = (end - start) / (1000 * 60); // Convert to minutes
      }
    }
    
    return {
        Type: t ? t('reports.table.schedule') : t('reports.table.schedule'),
        Date: schedule.date,
        'Start Time': schedule.startTime,
        'End Time': schedule.endTime,
        Duration: `${(duration / 60).toFixed(1)}h`,
        Minutes: duration,
        Notes: schedule.notes || schedule.title || ''
      };
  });

  // Add schedules worksheet if there are schedules
  if (formattedSchedules.length > 0) {
    const wsSchedules = utils.json_to_sheet(formattedSchedules);
    
    // Apply centered style to all cells in the worksheet
    const range = utils.decode_range(wsSchedules['!ref']);
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = utils.encode_cell({ r: row, c: col });
        if (wsSchedules[cellRef]) {
          wsSchedules[cellRef].s = centeredStyle;
        }
      }
    }
    
    utils.book_append_sheet(wb, wsSchedules, t ? t('schedule.title') : t('schedule.title'));
  }

  // 3. Format custom shifts data for Excel
  const formattedShifts = shifts.map(shift => {
    return {
      [t ? t('shifts.name') : t('shifts.name')]: shift.name,
      [t ? t('shifts.start_time') : t('shifts.start_time')]: shift.startTime,
      [t ? t('shifts.end_time') : t('shifts.end_time')]: shift.endTime,
      [t ? t('shifts.custom_duration') : t('shifts.custom_duration')]: shift.customDuration || '',
      [t ? t('shifts.shift_type') : t('shifts.shift_type')]: shift.shiftType || 'day'
    };
  });

  // Add shifts worksheet if there are shifts
  if (formattedShifts.length > 0) {
    const wsShifts = utils.json_to_sheet(formattedShifts);
    
    // Apply centered style to all cells in the worksheet
    const range = utils.decode_range(wsShifts['!ref']);
    for (let row = range.s.r; row <= range.e.r; row++) {
      for (let col = range.s.c; col <= range.e.c; col++) {
        const cellRef = utils.encode_cell({ r: row, c: col });
        if (wsShifts[cellRef]) {
          wsShifts[cellRef].s = centeredStyle;
        }
      }
    }
    
    utils.book_append_sheet(wb, wsShifts, t ? t('shifts.custom_shifts') : t('shifts.custom_shifts'));
  }

  // 4. Create summary data
  // Calculate total minutes
  const totalMinutesFromEntries = entries.reduce((sum, entry) => sum + entry.duration, 0);
  const totalMinutesFromSchedules = formattedSchedules.reduce((sum, schedule) => sum + (schedule.Minutes || 0), 0);
  const totalMinutes = totalMinutesFromEntries + totalMinutesFromSchedules;
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Summary data
  const summaryData = [
      { [t ? t('reports.summary_item') : t('reports.summary_item')]: t ? t('reports.entries_count') : t('reports.entries_count'), [t ? t('reports.value') : t('reports.value')]: entries.length },
      { [t ? t('reports.summary_item') : t('reports.summary_item')]: t ? t('reports.schedules_count') : t('reports.schedules_count'), [t ? t('reports.value') : t('reports.value')]: schedules.length },
      { [t ? t('reports.summary_item') : t('reports.summary_item')]: t ? t('reports.custom_shifts_count') : t('reports.custom_shifts_count'), [t ? t('reports.value') : t('reports.value')]: shifts.length },
      { [t ? t('reports.summary_item') : t('reports.summary_item')]: t ? t('reports.total_hours') : t('reports.total_hours'), [t ? t('reports.value') : t('reports.value')]: totalHours },
      { [t ? t('reports.summary_item') : t('reports.summary_item')]: t ? t('reports.total_minutes') : t('reports.total_minutes'), [t ? t('reports.value') : t('reports.value')]: totalMinutes }
    ];

  const wsSummary = utils.json_to_sheet(summaryData);
  
  // Apply centered style to all cells in the worksheet
  const range = utils.decode_range(wsSummary['!ref']);
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = utils.encode_cell({ r: row, c: col });
      if (wsSummary[cellRef]) {
        wsSummary[cellRef].s = centeredStyle;
      }
    }
  }
  
  utils.book_append_sheet(wb, wsSummary, t ? t('reports.summary') : t('reports.summary'));

  // Export to file
  writeFile(wb, `${filename}.xlsx`);
};