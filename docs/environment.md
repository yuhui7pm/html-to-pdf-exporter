# 环境变量配置说明

## 基础配置

```bash
# 服务端口
PORT=3000

# 环境模式 (development/production)
NODE_ENV=development
```

## Puppeteer 配置

```bash
# Puppeteer 配置
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
PUPPETEER_CACHE_DIR=/tmp/.cache/puppeteer

# 可选：自定义浏览器可执行文件路径
PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

## Render.com 部署配置

```bash
# Render.com 特定配置
NODE_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
RENDER_EXTERNAL_URL=https://your-service-name.onrender.com
```

## 使用方法

1. 本地开发时，创建 `.env` 文件并复制上述配置
2. 在 Render.com 部署时，在控制台中设置环境变量
