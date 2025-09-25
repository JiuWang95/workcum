/**
 * 根据班次名称生成确定性颜色
 * 使用哈希算法确保相同名称的班次在所有视图中显示一致的颜色
 */

// 生成哈希值的函数
const hashCode = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // 转换为32位整数
  }
  return Math.abs(hash);
};

// 将哈希值转换为HSL颜色
const hashToHSL = (hash) => {
  const hue = hash % 360;
  const saturation = 70 + (hash % 30); // 70-99%
  const lightness = 40 + (hash % 20);  // 40-59%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

// 根据班次名称生成颜色
export const getShiftColor = (shiftName) => {
  if (!shiftName) return 'hsl(220, 70%, 45%)'; // 默认蓝色
  const hash = hashCode(shiftName);
  return hashToHSL(hash);
};

// 根据班次名称生成浅色背景色
export const getShiftBackgroundColor = (shiftName) => {
  if (!shiftName) return 'hsl(220, 70%, 90%)'; // 默认浅蓝色
  const hash = hashCode(shiftName);
  const hue = hash % 360;
  const saturation = 50 + (hash % 30); // 50-79%
  const lightness = 85 + (hash % 10);  // 85-94%
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};