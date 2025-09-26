/**
 * 根据班次类型生成确定性颜色
 * 使用预定义的颜色映射确保相同类型的班次在所有视图中显示一致的颜色
 */

// 班次类型到颜色的映射
const shiftTypeToColorMap = {
  'day': { // 白天班 - 蓝色
    hue: 220,
    saturation: 80,
    lightness: 50,
    bgLightness: 90
  },
  'overnight': { // 跨夜班 - 紫色
    hue: 280,
    saturation: 80,
    lightness: 50,
    bgLightness: 90
  },
  'rest': { // 休息日 - 绿色
    hue: 120,
    saturation: 80,
    lightness: 50,
    bgLightness: 90
  },
  'regular': { // 常规班次 - 橙色
    hue: 30,
    saturation: 80,
    lightness: 50,
    bgLightness: 90
  }
};

// 根据班次类型生成颜色
export const getShiftColor = (shiftType) => {
  // 如果没有提供班次类型，默认使用白天班
  if (!shiftType) {
    shiftType = 'day';
  }
  
  // 如果班次类型不在映射中，默认使用白天班
  const colorConfig = shiftTypeToColorMap[shiftType] || shiftTypeToColorMap['day'];
  
  return `hsl(${colorConfig.hue}, ${colorConfig.saturation}%, ${colorConfig.lightness}%)`;
};

// 根据班次类型生成浅色背景色
export const getShiftBackgroundColor = (shiftType) => {
  // 如果没有提供班次类型，默认使用白天班
  if (!shiftType) {
    shiftType = 'day';
  }
  
  // 如果班次类型不在映射中，默认使用白天班
  const colorConfig = shiftTypeToColorMap[shiftType] || shiftTypeToColorMap['day'];
  
  return `hsl(${colorConfig.hue}, ${colorConfig.saturation}%, ${colorConfig.bgLightness}%)`;
};