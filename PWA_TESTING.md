# PWA功能测试指南

## 已完成的PWA集成

我们已经成功为Time Tracker应用添加了PWA（渐进式网页应用）功能。以下是已完成的配置：

1. 安装了`vite-plugin-pwa`插件
2. 配置了Vite以生成PWA所需文件
3. 创建了应用图标和manifest文件
4. 生成了Service Worker文件用于离线缓存

## 生成的PWA文件

构建项目后，在`dist`目录中会生成以下PWA相关文件：
- `manifest.json` - 应用清单文件
- `sw.js` - Service Worker文件
- `workbox-*.js` - Workbox库文件
- `registerSW.js` - Service Worker注册脚本

## 测试PWA功能

要在本地测试PWA功能，请按照以下步骤操作：

1. 构建项目：
   ```
   npm run build
   ```

2. 启动预览服务器：
   ```
   npm run preview:pwa
   ```

3. 在浏览器中打开应用（通常在 http://localhost:4173）

4. 检查以下PWA功能：
   - 应用应该能够离线工作
   - 应该可以在设备上安装为独立应用
   - 应该有应用图标和启动画面

## 部署时的PWA

当部署到生产环境（HTTPS）时，PWA功能将完全正常工作，包括：
- 桌面和移动设备上的安装提示
- 离线访问应用功能
- 后台同步数据
- 推送通知（如果实现）

## 注意事项

- PWA的某些功能（如安装提示）在开发环境中可能无法完全测试
- Service Worker需要HTTPS环境才能正常工作（localhost除外）
- 为了获得最佳PWA体验，建议在移动设备上测试