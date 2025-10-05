/**
 * 数据管理服务
 * 用于统一管理localStorage中的数据，确保数据持久化和一致性
 */

// 数据键名常量
export const DATA_KEYS = {
  TIME_ENTRIES: 'timeEntries',
  SCHEDULES: 'schedules',
  CUSTOM_SHIFTS: 'customShifts'
};

/**
 * 从localStorage获取数据
 * @param {string} key - 数据键名
 * @param {any} defaultValue - 默认值
 * @returns {any} 解析后的数据
 */
export const getData = (key, defaultValue = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
};

/**
 * 将数据保存到localStorage
 * @param {string} key - 数据键名
 * @param {any} data - 要保存的数据
 */
export const setData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
};

/**
 * 获取所有数据
 * @returns {Object} 包含所有数据的对象
 */
export const getAllData = () => {
  return {
    timeEntries: getData(DATA_KEYS.TIME_ENTRIES),
    schedules: getData(DATA_KEYS.SCHEDULES),
    customShifts: getData(DATA_KEYS.CUSTOM_SHIFTS)
  };
};

/**
 * 保存所有数据
 * @param {Object} data - 包含所有数据的对象
 */
export const setAllData = (data) => {
  Object.keys(data).forEach(key => {
    if (DATA_KEYS[key.toUpperCase()]) {
      setData(DATA_KEYS[key.toUpperCase()], data[key]);
    }
  });
};

/**
 * 清除所有数据
 */
export const clearAllData = () => {
  Object.values(DATA_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
};

/**
 * 导出所有数据为JSON字符串
 * @returns {string} JSON字符串
 */
export const exportAllData = () => {
  const data = getAllData();
  data.exportDate = new Date().toISOString();
  return JSON.stringify(data, null, 2);
};

/**
 * 从JSON字符串导入数据
 * @param {string} jsonString - JSON字符串
 * @param {boolean} overwrite - 是否覆盖现有数据
 */
export const importDataFromJSON = (jsonString, overwrite = false) => {
  try {
    const data = JSON.parse(jsonString);
    
    // 验证数据结构
    if (!data.timeEntries || !data.schedules) {
      throw new Error('Invalid data format');
    }
    
    if (overwrite) {
      // 覆盖模式：直接替换所有数据
      setAllData({
        timeEntries: data.timeEntries,
        schedules: data.schedules,
        customShifts: data.customShifts || []
      });
    } else {
      // 合并模式：合并现有数据和新数据
      const existingData = getAllData();
      
      // 合并数据，避免重复ID
      const mergedTimeEntries = mergeData(existingData.timeEntries, data.timeEntries, 'id');
      const mergedSchedules = mergeData(existingData.schedules, data.schedules, 'id');
      const mergedCustomShifts = mergeData(existingData.customShifts, data.customShifts || [], 'id');
      
      setAllData({
        timeEntries: mergedTimeEntries,
        schedules: mergedSchedules,
        customShifts: mergedCustomShifts
      });
    }
    
    return true;
  } catch (error) {
    console.error('Error importing data:', error);
    throw error;
  }
};

/**
 * 合并两个数据数组，避免重复ID
 * @param {Array} existingData - 现有数据
 * @param {Array} newData - 新数据
 * @param {string} idField - ID字段名
 * @returns {Array} 合并后的数据
 */
const mergeData = (existingData, newData, idField) => {
  const existingIds = new Set(existingData.map(item => item[idField]));
  const uniqueNewData = newData.filter(item => !existingIds.has(item[idField]));
  return [...existingData, ...uniqueNewData];
};

/**
 * 监听localStorage变化事件
 * @param {Function} callback - 回调函数
 */
export const watchStorageChanges = (callback) => {
  const handleStorageChange = (e) => {
    if (Object.values(DATA_KEYS).includes(e.key)) {
      callback(e.key, e.newValue ? JSON.parse(e.newValue) : null);
    }
  };

  window.addEventListener('storage', handleStorageChange);
  
  // 返回清理函数
  return () => {
    window.removeEventListener('storage', handleStorageChange);
  };
};

export default {
  DATA_KEYS,
  getData,
  setData,
  getAllData,
  setAllData,
  clearAllData,
  exportAllData,
  importDataFromJSON,
  watchStorageChanges
};