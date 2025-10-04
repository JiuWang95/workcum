import { createCanvas, loadImage } from 'canvas';
import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 创建画布并绘制简单的日历图标
function createCalendarIcon(size) {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext('2d');
  
  // 背景
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(0, 0, size, size);
  
  // 日历页面
  ctx.fillStyle = '#ffffff';
  const margin = size * 0.1;
  ctx.fillRect(margin, margin * 1.5, size - margin * 2, size - margin * 2.5);
  
  // 顶部条纹
  ctx.fillStyle = '#be1e2d';
  ctx.fillRect(margin, margin * 1.5, size - margin * 2, margin * 0.8);
  
  // 日历网格
  ctx.strokeStyle = '#d0d2d3';
  ctx.lineWidth = 1;
  
  const gridSize = (size - margin * 2) / 7;
  const startY = margin * 2.8;
  
  for (let i = 0; i <= 7; i++) {
    // 垂直线
    ctx.beginPath();
    ctx.moveTo(margin + i * gridSize, startY);
    ctx.lineTo(margin + i * gridSize, size - margin);
    ctx.stroke();
    
    if (i < 6) {
      // 水平线
      ctx.beginPath();
      ctx.moveTo(margin, startY + i * gridSize);
      ctx.lineTo(size - margin, startY + i * gridSize);
      ctx.stroke();
    }
  }
  
  return canvas.toBuffer('image/png');
}

// 生成图标
const sizes = [192, 512];
sizes.forEach(size => {
  const buffer = createCalendarIcon(size);
  const filename = `calendar-icon-${size}.png`;
  const filepath = join(__dirname, 'src', 'assets', filename);
  writeFileSync(filepath, buffer);
  console.log(`Generated ${filename}`);
});