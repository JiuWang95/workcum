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

// 定义居中样式
const centeredStyle = {
  alignment: {
    horizontal: "center",
    vertical: "center"
  }
};

export const exportToExcelReport = (entries, schedules, shifts, filename) => {
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
      Type: '工时记录',
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
    
    utils.book_append_sheet(wb, wsEntries, '工时记录');
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
    // 优先使用排班记录中保存的自定义工时
    if (schedule.customDuration !== undefined && schedule.customDuration !== null && schedule.customDuration !== "") {
      duration = convertDurationToHours(schedule.customDuration) * 60;
    } else if (schedule.selectedShift) {
      const shift = shifts.find(s => s.id === schedule.selectedShift);
      // 修改逻辑：如果自定义工时存在（即使是0），也使用自定义工时
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
      Type: '排班',
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
    
    utils.book_append_sheet(wb, wsSchedules, '排班表');
  }

  // 3. Format custom shifts data for Excel
  const formattedShifts = shifts.map(shift => {
    return {
      '班次名称': shift.name,
      '开始时间': shift.startTime,
      '结束时间': shift.endTime,
      '自定义工时': shift.customDuration || '',
      '班次类型': shift.shiftType || 'day'
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
    
    utils.book_append_sheet(wb, wsShifts, '自定义班次');
  }

  // 4. Create summary data
  // Calculate total minutes
  const totalMinutesFromEntries = entries.reduce((sum, entry) => sum + entry.duration, 0);
  const totalMinutesFromSchedules = formattedSchedules.reduce((sum, schedule) => sum + (schedule.Minutes || 0), 0);
  const totalMinutes = totalMinutesFromEntries + totalMinutesFromSchedules;
  const totalHours = (totalMinutes / 60).toFixed(1);

  // Summary data
  const summaryData = [
    { '统计项目': '工时记录总数', '数值': entries.length },
    { '统计项目': '排班记录总数', '数值': schedules.length },
    { '统计项目': '自定义班次总数', '数值': shifts.length },
    { '统计项目': '总工时(小时)', '数值': totalHours },
    { '统计项目': '总工时(分钟)', '数值': totalMinutes }
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
  
  utils.book_append_sheet(wb, wsSummary, '统计');

  // Export to file
  writeFile(wb, `${filename}.xlsx`);
};