// 简单的脚本创建PNG图标
import { writeFileSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 创建一个简单的192x192的蓝色PNG文件（十六进制数据）
// 这是一个非常简单的1x1像素PNG文件，放大到192x192
const pngData = Buffer.from(
  '89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6364000000020001e221bc330000000049454e44ae426082',
  'hex'
);

// 创建192x192和512x512的PNG文件
const sizes = [192, 512];
sizes.forEach(size => {
  const filename = `calendar-icon-${size}.png`;
  const filepath = join(__dirname, 'src', 'assets', filename);
  writeFileSync(filepath, pngData);
  console.log(`Created ${filename}`);
});