# 排班计算器 (Schedule Calculator)

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

#### Cloudflare Pages 部署指南

要将此应用程序部署到 Cloudflare Pages，请按照以下步骤操作：

1. **推送代码到 GitHub**：
   将您的代码推送到 GitHub 仓库（如果您还没有的话）。

2. **登录 Cloudflare Dashboard**：
   访问 [Cloudflare Dashboard](https://dash.cloudflare.com/) 并登录您的账户。

3. **创建 Pages 项目**：
   - 在左侧菜单中选择 "Workers & Pages"
   - 点击 "Create application" > "Pages" > "Connect to Git"

4. **连接到 Git 仓库**：
   - 选择您的 GitHub 账户和对应的仓库
   - 选择您要部署的分支（通常是 main 或 master）

5. **配置构建设置**：
   - **构建命令**: `npm run build`
   - **构建输出目录**: `dist`
   - **根目录**: 保持为空（默认为仓库根目录）

6. **部署**：
   点击 "Save and Deploy" 开始部署过程。

部署完成后，Cloudflare 会为您提供一个 `.pages.dev` 的临时 URL 来访问您的应用程序。您也可以配置自定义域名。

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