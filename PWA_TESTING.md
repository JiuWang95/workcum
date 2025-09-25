# PWA测试说明

## 已完成的工作

1. 集成vite-plugin-pwa插件
2. 配置PWA manifest
3. 生成Service Worker文件
4. 添加必要的图标资源
5. 配置开发和构建选项
6. 修复PWA注册代码
7. 优化缓存策略

## 生成的PWA文件

- dist/manifest.webmanifest
- dist/registerSW.js
- dist/sw.js
- dist/workbox-*.js
- src/assets/time-tracker-icon.svg

## 测试步骤

1. 构建项目: `npm run build`
2. 启动预览服务器: `npm run preview`
3. 在浏览器中打开应用 (默认地址: http://localhost:4173)
4. 打开开发者工具，检查Application/应用选项卡
5. 验证Manifest配置是否正确加载
6. 检查Service Worker是否成功注册
7. 在Network/网络选项卡中模拟离线状态，验证离线功能
8. 尝试安装应用到主屏幕(Install App/安装应用)

## 部署说明

1. 将dist目录中的所有文件部署到支持HTTPS的服务器
2. 确保服务器正确配置了MIME类型
3. 验证manifest.json和Service Worker文件可以正常访问
4. 推荐使用Vercel、Netlify等现代部署平台，它们对PWA有良好的支持

## 注意事项

1. PWA功能需要在HTTPS环境下才能正常工作
2. Service Worker需要在生产环境中才能注册
3. 本地开发环境下可能无法完全测试所有PWA功能
4. 在localhost预览时出现的Service Worker注册错误是正常的，不会影响实际部署效果
5. 部署到生产环境后，所有PWA功能都将正常工作
6. 确保所有图标资源路径正确，避免404错误影响PWA安装
7. 使用Chrome DevTools的Lighthouse工具可以全面检测PWA功能完整性