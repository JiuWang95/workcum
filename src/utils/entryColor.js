/**
 * 获取时间记录的颜色配置
 * @param {number} customHue - 自定义色调值 (0-360)
 * @returns {Object} 包含文字颜色和背景颜色的配置对象
 */
export const getEntryColor = (customHue) => {
  if (customHue === undefined || customHue === null) {
    // 默认颜色配置（橙色）
    return {
      textColor: '#F59E0B',        // 橙色文字
      backgroundColor: '#FDE68A',   // 浅橙色背景
      borderColor: '#F59E0B'       // 橙色边框
    };
  }
  
  // 使用自定义色调生成颜色
  return {
    textColor: `hsl(${customHue}, 80%, 35%)`,     // 深色文字
    backgroundColor: `hsl(${customHue}, 80%, 90%)`, // 浅色背景
    borderColor: `hsl(${customHue}, 80%, 50%)`     // 中等深度边框
  };
};

/**
 * 获取时间记录的背景颜色
 * @param {number} customHue - 自定义色调值 (0-360)
 * @returns {string} 背景颜色值
 */
export const getEntryBackgroundColor = (customHue) => {
  if (customHue === undefined || customHue === null) {
    return '#FDE68A'; // 默认浅橙色背景
  }
  return `hsl(${customHue}, 80%, 90%)`; // 浅色背景
};

/**
 * 获取时间记录的文字颜色
 * @param {number} customHue - 自定义色调值 (0-360)
 * @returns {string} 文字颜色值
 */
export const getEntryTextColor = (customHue) => {
  if (customHue === undefined || customHue === null) {
    return '#F59E0B'; // 默认橙色文字
  }
  return `hsl(${customHue}, 80%, 35%)`; // 深色文字
};

/**
 * 获取时间记录的边框颜色
 * @param {number} customHue - 自定义色调值 (0-360)
 * @returns {string} 边框颜色值
 */
export const getEntryBorderColor = (customHue) => {
  if (customHue === undefined || customHue === null) {
    return '#F59E0B'; // 默认橙色边框
  }
  return `hsl(${customHue}, 80%, 50%)`; // 中等深度边框
};