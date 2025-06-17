# HTML to PDF Exporter 📄

高性能的 HTML 转 PDF 后端服务，基于 **Puppeteer + Express.js** 构建，专为 [Render.com](https://render.com) 云平台优化。

## ✨ 特性

- 🚀 **高性能**：浏览器实例复用，优化内存使用
- 🎨 **完美渲染**：支持复杂 CSS、JavaScript 和现代网页特性
- 🔧 **高度可配置**：自定义页面尺寸、边距、页眉页脚
- 🌐 **多种输入**：支持 HTML 内容、URL 和模板
- ☁️ **云就绪**：针对 Render.com 部署优化
- 🛡️ **生产级**：完整的错误处理和安全配置

## 🚀 快速开始

### 前置要求

- Node.js 16.0+
- Yarn 包管理器 (推荐)

```bash
# 安装 Yarn（如果未安装）
npm install -g yarn

# 验证安装
yarn --version
```

> 📚 **需要 Yarn 帮助？** 查看 [Yarn 使用指南](docs/yarn-setup.md)

### 本地开发

```bash
# 克隆项目
git clone <your-repo-url>
cd html-to-pdf-exporter

# 安装依赖
yarn install

# 启动开发服务器
yarn dev

# 或启动生产服务器
yarn start
```

### 测试 API

```bash
# 运行内置测试
yarn test

# 检查服务健康状态
curl http://localhost:3000/health
```

## 🌐 部署到 Render.com

> 💡 **使用免费版？** 查看 [免费版部署指南](docs/render-free-tier.md) 获取专门优化的配置！

### 方式一：GitHub 集成（推荐）

1. 将代码推送到 GitHub 仓库
2. 在 [Render.com](https://render.com) 创建新的 Web Service
3. 连接你的 GitHub 仓库
4. Render 会自动检测并使用 `render.yaml` 配置

### 方式二：手动配置

1. 在 Render.com 创建新的 Web Service
2. 设置以下配置：
   - **Build Command**: `yarn install --production`
   - **Start Command**: `yarn start`
   - **Environment**: `Node`
   - **Plan**: `Free` 或更高配置
3. 环境变量会通过 `render.yaml` 自动配置

### 部署后验证

```bash
# 替换为你的 Render 域名
curl https://your-service-name.onrender.com/health
```

## 📚 API 文档

### 基础信息

- **Base URL**: `https://your-service-name.onrender.com`
- **Content-Type**: `application/json`
- **响应格式**: PDF 文件 (application/pdf)

### 1. HTML 转 PDF

将 HTML 内容转换为 PDF 文件。

**POST** `/api/html-to-pdf`

**请求体：**

```json
{
  "html": "<!DOCTYPE html><html><body><h1>Hello World</h1></body></html>",
  "options": {
    "format": "A4",
    "margin": {
      "top": "20px",
      "right": "20px",
      "bottom": "20px",
      "left": "20px"
    },
    "filename": "document.pdf",
    "scale": 1,
    "viewport": {
      "width": 1280,
      "height": 800
    },
    "headerFooter": {
      "enabled": true,
      "header": "<span style='font-size:10px;'>页眉内容</span>",
      "footer": "<span style='font-size:10px;'>页脚内容</span>"
    }
  }
}
```

### 2. URL 转 PDF

将网页 URL 转换为 PDF 文件。

**POST** `/api/url-to-pdf`

**请求体：**

```json
{
  "url": "https://example.com",
  "options": {
    "format": "A4",
    "waitTime": 3000,
    "filename": "webpage.pdf"
  }
}
```

### 3. 模板转 PDF

使用模板和数据生成 PDF。

**POST** `/api/template-to-pdf`

**请求体：**

```json
{
  "template": "<h1>{{title}}</h1><p>用户: {{username}}</p>",
  "data": {
    "title": "月度报告",
    "username": "张三"
  },
  "options": {
    "format": "A4",
    "filename": "report.pdf"
  }
}
```

### 4. 健康检查

检查服务状态。

**GET** `/health`

**响应：**

```json
{
  "status": "OK",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "memory": {...},
  "uptime": 3600,
  "environment": "production"
}
```

## 🛠️ 配置选项

### PDF 格式选项

| 参数              | 类型    | 默认值    | 描述                                      |
| ----------------- | ------- | --------- | ----------------------------------------- |
| `format`          | string  | "A4"      | 页面尺寸 (A4, A3, Letter, Legal, Tabloid) |
| `margin`          | object  | 20px 各边 | 页面边距                                  |
| `scale`           | number  | 1         | 缩放比例 (0.1-2)                          |
| `printBackground` | boolean | true      | 是否打印背景                              |
| `landscape`       | boolean | false     | 是否横向                                  |

### 视窗选项

| 参数              | 类型   | 默认值 | 描述     |
| ----------------- | ------ | ------ | -------- |
| `viewport.width`  | number | 1280   | 视窗宽度 |
| `viewport.height` | number | 800    | 视窗高度 |

## 💡 使用示例

### JavaScript/Node.js

```javascript
const axios = require("axios");

async function generatePDF() {
  const response = await axios.post(
    "https://your-service.onrender.com/api/html-to-pdf",
    {
      html: "<h1>Hello PDF!</h1>",
      options: { format: "A4" },
    },
    {
      responseType: "arraybuffer",
    }
  );

  // 保存 PDF
  require("fs").writeFileSync("output.pdf", response.data);
}
```

### cURL

```bash
curl -X POST https://your-service.onrender.com/api/html-to-pdf \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Hello World</h1>"}' \
  --output document.pdf
```

### Python

```python
import requests

response = requests.post(
    'https://your-service.onrender.com/api/html-to-pdf',
    json={
        'html': '<h1>Hello PDF!</h1>',
        'options': {'format': 'A4'}
    }
)

with open('output.pdf', 'wb') as f:
    f.write(response.content)
```

## 🔧 高级配置

### 环境变量

| 变量名                | 描述               | 默认值      |
| --------------------- | ------------------ | ----------- |
| `PORT`                | 服务端口           | 3000        |
| `NODE_ENV`            | 环境模式           | development |
| `PUPPETEER_CACHE_DIR` | Puppeteer 缓存目录 | -           |

### 性能优化建议

1. **使用 Starter 或更高配置**：PDF 生成需要较多内存
2. **启用请求压缩**：已内置 gzip 压缩
3. **合理设置超时时间**：复杂页面可能需要更长处理时间
4. **批量处理**：避免并发过多请求

## 🚨 常见问题

### Q: PDF 中图片显示不正常？

A: 确保图片 URL 可公开访问，或使用 base64 编码的图片。

### Q: 中文字体显示异常？

A: 在 CSS 中指定中文字体：

```css
body {
  font-family: "PingFang SC", "Microsoft YaHei", Arial, sans-serif;
}
```

### Q: 服务响应慢？

A: 考虑升级到更高配置的 Render 计划，或优化 HTML 内容复杂度。

### Q: 部署失败？

A: 检查 Render 日志，确保依赖安装成功，特别是 Puppeteer 的 Chromium 下载。

## 📋 TODO

- [ ] 添加 Redis 缓存支持
- [ ] 实现 PDF 水印功能
- [ ] 支持更多模板引擎 (Handlebars, EJS)
- [ ] 添加 API 限流
- [ ] 支持批量转换

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📁 项目结构

```
html-to-pdf-exporter/
├── 📄 package.json              # 项目配置和依赖
├── 🔒 yarn.lock                 # 锁定依赖版本
├── ⚙️ .yarnrc                   # Yarn 配置优化
├── ☁️ render.yaml               # Render.com 部署配置
├── 🚀 server.js                 # 主服务文件
├── 📋 test/
│   └── test-api.js              # API 测试
├── 📜 scripts/
│   └── start.sh                 # 快速启动脚本
├── 📚 docs/
│   ├── render-free-tier.md      # 免费版部署指南
│   ├── yarn-setup.md            # Yarn 使用指南
│   └── environment.md           # 环境变量说明
└── 📖 README.md                 # 项目文档
```

## 📄 许可证

MIT License

---

**部署愉快！** 🎉

如有问题，请参考：

- 📚 [Yarn 使用指南](docs/yarn-setup.md)
- 🆓 [免费版部署指南](docs/render-free-tier.md)
- 🌐 [Render.com 文档](https://render.com/docs)
- 🐛 [创建 Issue](../../issues)
