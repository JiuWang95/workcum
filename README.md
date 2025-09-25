# 排班计算器 (Time Tracker)

一个使用 React、Tailwind CSS 和 Vite 构建的简洁、优雅的排班计算器 Web 应用程序。

## 功能特性

- **时间记录**: 记录您的工作时间，包括开始和结束时间
- **报表生成**: 为特定日期范围生成报表，并支持导出到 Excel
- **日程安排**: 使用可视化日历规划您的每周日程
- **数据管理**: 导出和导入您的数据以进行备份或转移
- **响应式设计**: 支持移动设备、平板电脑和桌面设备
- **本地存储**: 所有数据都存储在您的浏览器本地

## 快速开始

### 前置要求

- Node.js (版本 14 或更高)
- npm 或 yarn

### 安装步骤

1. 克隆仓库:
   ```bash
   git clone <repository-url>
   ```

2. 进入项目目录:
   ```bash
   cd time-tracker
   ```

3. 安装依赖:
   ```bash
   npm install
   ```

### 开发环境

启动开发服务器:

```bash
npm run dev
```

应用程序将在 `http://localhost:3000` 上可用。

### 生产构建

创建生产构建版本:

```bash
npm run build
```

构建文件将位于 `dist` 目录中。

### 部署

此应用程序可以部署到任何静态托管服务，包括:

- GitHub Pages
- Netlify
- Vercel
- Cloudflare Pages

## 使用说明

1. **时间记录**: 使用时间记录页面记录您的工作时间
2. **报表**: 在报表页面生成报表并导出到 Excel
3. **日程**: 使用日程页面规划您的每周任务
4. **数据**: 使用数据页面备份或恢复您的数据

## 技术栈

- React 18
- React Router v6
- Tailwind CSS
- Vite
- SheetJS (xlsx) 用于 Excel 导出
- date-fns 用于日期处理

## 开源协议

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情