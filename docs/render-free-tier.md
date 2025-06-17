# Render.com 免费版部署指南 🆓

本指南专门针对 Render.com 免费版的限制进行了优化配置。

## 📊 免费版限制

| 项目         | 限制               | 我们的优化                       |
| ------------ | ------------------ | -------------------------------- |
| **内存**     | 512MB              | 设置 400MB 堆内存限制 + 内存监控 |
| **CPU**      | 共享 CPU           | 单进程模式 + 减少后台任务        |
| **冷启动**   | 闲置 15 分钟后休眠 | 添加健康检查保持唤醒             |
| **构建时间** | 15 分钟            | 仅安装生产依赖                   |
| **带宽**     | 100GB/月           | 启用 gzip 压缩                   |

## 🔧 已优化的配置

### 1. 内存管理

- ✅ 浏览器堆内存限制：300MB
- ✅ Node.js 堆内存限制：400MB
- ✅ 自动内存监控和重启
- ✅ 禁用不必要的浏览器功能

### 2. 性能优化

- ✅ 减小默认视窗尺寸：1024x768
- ✅ 更严格的超时控制：30 秒
- ✅ 单进程模式（生产环境）
- ✅ 资源请求拦截

## 🚀 部署步骤

### 1. 推送代码到 GitHub

```bash
git add .
git commit -m "Ready for Render.com free tier"
git push origin main
```

### 2. 在 Render.com 创建服务

1. 访问 [render.com](https://render.com)
2. 点击 "New +" → "Web Service"
3. 连接你的 GitHub 仓库
4. 选择 `html-to-pdf-exporter` 仓库

### 3. 配置检查

确保以下配置正确（通常自动检测）：

- **Name**: `html-to-pdf-exporter`
- **Environment**: `Node`
- **Build Command**: `yarn install --production`
- **Start Command**: `yarn start`
- **Plan**: `Free`

### 4. 环境变量（自动设置）

以下环境变量会通过 `render.yaml` 自动配置：

```
NODE_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
NODE_OPTIONS=--max-old-space-size=400
PUPPETEER_CACHE_DIR=/tmp/.cache/puppeteer
```

## ⚠️ 免费版注意事项

### 1. 服务休眠

- 闲置 15 分钟后服务会休眠
- 下次请求需要 30-60 秒冷启动时间
- **解决方案**: 使用外部监控服务定期访问 `/health` 端点

### 2. 内存限制

- 复杂的 HTML 可能导致内存不足
- **建议**:
  - 简化 HTML 结构
  - 减少大图片使用
  - 避免复杂的 CSS 动画

### 3. 处理时间

- 单个 PDF 生成建议控制在 20 秒内
- 避免同时处理多个请求
- **建议**: 客户端添加超时提示

## 🧪 测试部署

部署完成后，测试你的服务：

```bash
# 替换为你的 Render 域名
curl https://your-service-name.onrender.com/health

# 测试 PDF 生成
curl -X POST https://your-service-name.onrender.com/api/html-to-pdf \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Hello Free Tier!</h1>"}' \
  --output test.pdf
```

## 📈 升级建议

如果你的应用需要更高性能，考虑升级到付费计划：

| 计划         | 内存  | CPU  | 价格   |
| ------------ | ----- | ---- | ------ |
| **Starter**  | 512MB | 共享 | $7/月  |
| **Standard** | 2GB   | 专用 | $25/月 |
| **Pro**      | 4GB   | 专用 | $85/月 |

## 🔍 监控和调试

### 查看日志

```bash
# 在 Render 控制台查看实时日志
# 或使用 Render CLI
render logs --service-id=your-service-id --follow
```

### 常见错误解决

1. **内存不足错误**

   - 检查内存监控日志
   - 简化 HTML 内容

2. **超时错误**

   - 增加客户端超时时间
   - 检查 HTML 资源加载

3. **冷启动慢**
   - 这是免费版正常现象
   - 考虑使用 uptime 监控服务

## 💡 优化技巧

1. **减少包大小**

   ```bash
   # 只安装生产依赖
   yarn install --production
   ```

2. **缓存优化**

   ```javascript
   // 在 HTML 中使用内联 CSS，减少外部资源
   const html = `
     <style>
       body { font-family: Arial; margin: 20px; }
     </style>
     <h1>高效的 PDF</h1>
   `;
   ```

3. **批量处理**
   ```javascript
   // 避免并发请求，使用队列处理
   const queue = [];
   ```

---

🎉 **恭喜！你的 HTML to PDF 服务已准备好在 Render.com 免费版上运行！**
