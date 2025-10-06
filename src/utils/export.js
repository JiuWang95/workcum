import { utils, writeFile } from 'xlsx';
import { format, parseISO, eachDayOfInterval } from 'date-fns';
import { getEntryColor } from './entryColor';
import { getShiftColor, shiftTypeToColorMap } from './shiftColor';

// Function to convert duration string to hours
const convertDurationToHours = (durationStr) => {
  if (!durationStr) return 0;
  
  const hoursMatch = durationStr.match(/(\d+(?:\.\d+)?)h/);
  const minutesMatch = durationStr.match(/(\d+(?:\.\d+)?)m/);
  
  const hours = hoursMatch ? parseFloat(hoursMatch[1]) : 0;
  const minutes = minutesMatch ? parseFloat(minutesMatch[1]) : 0;
  
  return hours + (minutes / 60);
};

// Function to get shift type text
const getShiftTypeText = (shiftType, t) => {
  switch (shiftType) {
    case 'day':
      return t ? t('time_entry.custom_shift.day_shift') : '白天班';
    case 'rest':
      return t ? t('time_entry.custom_shift.rest_day') : '休息日';
    case 'overnight':
      return t ? t('time_entry.custom_shift.overnight_shift') : '跨夜班';
    case 'special':
      return t ? t('time_entry.custom_shift.special_shift') : '特殊班次';
    default:
      return t ? t('time_entry.custom_shift.day_shift') : '白天班';
  }
};

export const exportToExcelReport = (entries, schedules, shifts, fileName, t) => {
  // Combine entries and schedules into a single array with type identifiers
  const allRecords = [
    ...entries.map(entry => ({ ...entry, type: 'entry' })),
    ...schedules.map(schedule => ({ ...schedule, type: 'schedule' }))
  ];

  // Sort all records by date and time
  allRecords.sort((a, b) => {
    // First sort by date
    if (a.date !== b.date) {
      return a.date.localeCompare(b.date);
    }
    
    // If dates are the same, sort by start time
    return a.startTime.localeCompare(b.startTime);
  });

  // Create the data array for Excel with custom formatting
  const data = [
    [t('reports.table.date'), t('reports.table.notes'), t('reports.table.duration'), t('reports.table.start_time'), t('reports.table.end_time'), t('reports.table.shift_type'), t('reports.table.type')]
  ];

  // Add all records to the data array
  const sortedRecords = allRecords.map(record => {
    if (record.type === 'entry') {
      // For time entries, use the duration directly (convert from minutes to hours)
      const durationInHours = record.duration / 60;
      return {
        ...record,
        customHours: durationInHours
      };
    } else {
      // For schedules, calculate duration based on customDuration, shift customDuration, or start/end time
      let hours = 0;
      // Prioritize using the saved custom duration in the schedule record (in hours with decimals)
      if (record.customDuration !== undefined && record.customDuration !== null && record.customDuration !== "") {
        hours = convertDurationToHours(record.customDuration);
      } else if (record.selectedShift) {
        const shift = shifts.find(s => s.id === record.selectedShift);
        if (shift && shift.customDuration !== undefined && shift.customDuration !== null && shift.customDuration !== "") {
          hours = convertDurationToHours(shift.customDuration);
        } else {
          // Calculate duration from start and end time and convert to hours
          const start = new Date(`1970-01-01T${record.startTime}:00`);
          const end = new Date(`1970-01-01T${record.endTime}:00`);
          const durationInMinutes = (end - start) / (1000 * 60); // Convert to minutes
          hours = durationInMinutes / 60; // Convert to hours
        }
      }
      return {
        ...record,
        customHours: hours
      };
    }
  });

  // Add each record to the data array
  sortedRecords.forEach(record => {
    let shiftTypeText = '';
    if (record.type === 'schedule' && record.selectedShift) {
      const shift = shifts.find(s => s.id === record.selectedShift);
      if (shift) {
        shiftTypeText = getShiftTypeText(shift.shiftType, t);
      }
    }
    
    const rowData = [
      record.date,
      record.type === 'entry' ? (record.notes || t('time_entry.entry')) : (record.notes || record.title || '-'),
      record.customHours.toFixed(1) + 'h',
      record.startTime,
      record.endTime,
      shiftTypeText,
      record.type === 'entry' ? t('reports.table.time_entry') : t('reports.table.schedule')
    ];
    data.push(rowData);
  });

  // 修改计算逻辑：对于选定日期范围内的每一天，如果没有数据则使用0
  const totalHours = (() => {
    // 如果没有记录，返回0
    if (allRecords.length === 0) {
      return 0;
    }
    
    // 确定日期范围
    const dates = allRecords.map(record => record.date);
    const startDate = new Date(Math.min(...dates.map(date => new Date(date))));
    const endDate = new Date(Math.max(...dates.map(date => new Date(date))));
    
    // 生成日期范围内的所有日期
    const dateRange = eachDayOfInterval({
      start: startDate,
      end: endDate
    });
    
    // 对于每个日期，计算该日期的工时（如果没有数据则为0）
    const dailyHours = dateRange.map(date => {
      const dateStr = format(date, 'yyyy-MM-dd');
      // 获取该日期的所有记录
      const recordsForDate = sortedRecords.filter(record => record.date === dateStr);
      
      // 如果该日期没有记录，返回0
      if (recordsForDate.length === 0) {
        return 0;
      }
      
      // 如果有记录，计算这些记录的总工时
      return recordsForDate.reduce((sum, record) => sum + record.customHours, 0);
    });
    
    // 返回所有日期的工时总和
    return dailyHours.reduce((sum, hours) => sum + hours, 0);
  })();

  // 根据用户需求修改总计行格式
  // 1. 在数据和总计行之间添加一个空行
  data.push(['']);
  
  // 2. 修改总计行格式：总计文本放在日期列，总工时放在自定义工时列（第3列）
  const totalRow = Array(7).fill(''); // 创建一个7列的空数组
  totalRow[0] = t('reports.total'); // 总计文本放在日期列（第1列）
  totalRow[2] = totalHours.toFixed(1) + 'h'; // 总工时放在自定义工时列（第3列）
  data.push(totalRow);

  // Create a new workbook and worksheet
  const ws = utils.aoa_to_sheet(data);

  // Apply styling to the worksheet
  const range = utils.decode_range(ws['!ref']);
  
  // Style the header row - 加大字体并加粗
  for (let C = range.s.C; C <= range.e.C; ++C) {
    const address = utils.encode_cell({ r: 0, c: C });
    if (!ws[address]) continue;
    ws[address].s = {
      font: { bold: true, sz: 14, color: { rgb: "FFFFFF" } }, // 加大字体(sz: 14)并加粗
      fill: { fgColor: { rgb: "4F46E5" } }, // Indigo color
      alignment: { horizontal: "center", vertical: "center" } // 居中对齐
    };
  }
  
  // Style the data rows (center align all cells except notes)
  for (let R = 1; R <= range.e.R; ++R) {
    for (let C = 0; C <= range.e.C; ++C) {
      const address = utils.encode_cell({ r: R, c: C });
      if (!ws[address]) continue;
      
      // Center align all cells
      if (!ws[address].s) ws[address].s = {};
      ws[address].s.alignment = { horizontal: "center", vertical: "center" }; // 垂直居中
      
      // Special styling for notes column (second column)
      if (C === 1) {
        ws[address].s.alignment = { horizontal: "left", vertical: "center" }; // 左对齐但垂直居中
      }
      
      // Special styling for the total row (last row) - 高亮加粗显示
      if (R === range.e.R) {
        ws[address].s.font = { bold: true };
        ws[address].s.fill = { fgColor: { rgb: "E0E7FF" } }; // Light indigo color
      }
      
      // 特殊处理总计行中的总工时单元格（第3列）- 加大加粗蓝色字体显示
      if (R === range.e.R && C === 2) {
        ws[address].s.font = { bold: true, sz: 14, color: { rgb: "1E40AF" } }; // 加粗并加大字体(sz: 14)，蓝色字体
        ws[address].s.fill = { fgColor: { rgb: "E0E7FF" } }; // Light indigo color
      }
    }
  }

  // Create workbook and add worksheet
  const wb = utils.book_new();
  utils.book_append_sheet(wb, ws, t('reports.title'));

  // Export the workbook
  writeFile(wb, `${fileName}.xlsx`);
};