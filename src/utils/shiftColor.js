/**
 * Generate deterministic colors based on shift type
 * Using predefined color mapping to ensure consistent colors for the same shift type across all views
 * 
 * Color mapping:
 * - Day shift (day) - Green
 * - Overnight shift (overnight) - Blue
 * - Rest day (rest) - Purple
 * - Regular shift (regular) - Orange
 */

// Shift type to color mapping
const shiftTypeToColorMap = {
  'day': { // Day shift - Green
    hue: 120,
    saturation: 80,
    lightness: 50,
    bgLightness: 90
  },
  'overnight': { // Overnight shift - Blue
    hue: 220,
    saturation: 80,
    lightness: 50,
    bgLightness: 90
  },
  'rest': { // Rest day - Purple
    hue: 280,
    saturation: 80,
    lightness: 50,
    bgLightness: 90
  },
  'regular': { // Regular shift - Orange
    hue: 30,
    saturation: 80,
    lightness: 50,
    bgLightness: 90
  }
};

// Generate color based on shift type
export const getShiftColor = (shiftType) => {
  // If no shift type is provided, default to day shift
  if (!shiftType) {
    shiftType = 'day';
  }
  
  // If shift type is not in mapping, default to day shift
  const colorConfig = shiftTypeToColorMap[shiftType] || shiftTypeToColorMap['day'];
  
  return `hsl(${colorConfig.hue}, ${colorConfig.saturation}%, ${colorConfig.lightness}%)`;
};

// Generate light background color based on shift type
export const getShiftBackgroundColor = (shiftType) => {
  // If no shift type is provided, default to day shift
  if (!shiftType) {
    shiftType = 'day';
  }
  
  // If shift type is not in mapping, default to day shift
  const colorConfig = shiftTypeToColorMap[shiftType] || shiftTypeToColorMap['day'];
  
  return `hsl(${colorConfig.hue}, ${colorConfig.saturation}%, ${colorConfig.bgLightness}%)`;
};