// 这个脚本用于更新现有的班次数据，将旧的isOvernight字段转换为新的shiftType枚举

// 检查是否存在localStorage（在浏览器环境中运行）
if (typeof localStorage !== 'undefined') {
  // 获取现有的班次数据
  const shifts = JSON.parse(localStorage.getItem('customShifts') || '[]');
  
  console.log('更新前的班次数据:', shifts);
  
  // 更新班次数据结构
  const updatedShifts = shifts.map(shift => {
    // 如果已经有shiftType字段，保持不变
    if (shift.shiftType) {
      return shift;
    }
    
    // 如果有isOvernight字段，转换为shiftType
    if (shift.isOvernight !== undefined) {
      return {
        ...shift,
        shiftType: shift.isOvernight ? 'overnight' : 'day',
        isOvernight: undefined // 移除旧字段
      };
    }
    
    // 如果既没有shiftType也没有isOvernight，默认为day类型
    return {
      ...shift,
      shiftType: 'day'
    };
  });
  
  // 保存更新后的班次数据
  localStorage.setItem('customShifts', JSON.stringify(updatedShifts));
  
  console.log('更新后的班次数据:', updatedShifts);
  console.log('班次数据更新完成！');
} else {
  console.log('localStorage不可用，此脚本需要在浏览器环境中运行');
}