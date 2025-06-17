# Yarn 包管理器使用指南 📦

本项目使用 **Yarn** 作为包管理器，提供更快的安装速度和更好的依赖管理。

## 🚀 安装 Yarn

### 全局安装（推荐）

```bash
# 使用 npm 安装 yarn
npm install -g yarn

# 验证安装
yarn --version
```

### 其他安装方式

```bash
# macOS (使用 Homebrew)
brew install yarn

# Windows (使用 Chocolatey)
choco install yarn

# Ubuntu/Debian
curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | sudo apt-key add -
echo "deb https://dl.yarnpkg.com/debian/ stable main" | sudo tee /etc/apt/sources.list.d/yarn.list
sudo apt update && sudo apt install yarn
```

## 📝 项目常用命令

### 开发环境

```bash
# 安装所有依赖
yarn install

# 启动开发服务器（带热重载）
yarn dev

# 启动生产服务器
yarn start

# 运行测试
yarn test
```

### 生产环境

```bash
# 仅安装生产依赖（用于部署）
yarn install --production

# 或使用别名命令
yarn install-deps
```

## 🔧 Yarn 配置优化

### 项目配置

创建 `.yarnrc` 文件（已在项目中）：

```
# 提升安装速度
registry "https://registry.yarnpkg.com/"

# 并行安装
network-concurrency 16

# 缓存优化
cache-folder ".yarn-cache"
```

### 环境变量

```bash
# 设置 Yarn 缓存目录
export YARN_CACHE_FOLDER=~/.yarn-cache

# 设置网络超时时间
export YARN_NETWORK_TIMEOUT=300000
```

## 🌐 Render.com 部署配置

Yarn 在 Render.com 上的配置已经优化：

### render.yaml 配置

```yaml
buildCommand: yarn install --production
startCommand: yarn start
```

### 环境变量

```bash
NODE_ENV=production
YARN_CACHE_FOLDER=/tmp/.yarn-cache
```

## 🆚 Yarn vs npm 对比

| 特性           | Yarn          | npm                  |
| -------------- | ------------- | -------------------- |
| **安装速度**   | ⚡ 更快       | 🐌 较慢              |
| **离线安装**   | ✅ 支持       | ❌ 不支持            |
| **确定性安装** | ✅ yarn.lock  | ✅ package-lock.json |
| **并行安装**   | ✅ 默认       | ✅ v7+               |
| **工作空间**   | ✅ 原生支持   | ✅ v7+               |
| **安全性**     | ✅ 校验和检查 | ✅ 漏洞检查          |

## 📁 项目文件结构

```
html-to-pdf-exporter/
├── package.json          # 项目配置和依赖
├── yarn.lock             # 锁定依赖版本（自动生成）
├── .yarnrc               # Yarn 配置
├── node_modules/         # 依赖包（自动生成）
└── ...
```

## 🛠️ 故障排除

### 清理缓存

```bash
# 清理 yarn 缓存
yarn cache clean

# 删除 node_modules 和重新安装
rm -rf node_modules yarn.lock
yarn install
```

### 检查依赖

```bash
# 检查过期的包
yarn outdated

# 检查依赖树
yarn list

# 检查为什么安装了某个包
yarn why [package-name]
```

### 常见错误解决

1. **网络问题**

   ```bash
   # 切换到淘宝镜像
   yarn config set registry https://registry.npmmirror.com/
   ```

2. **权限问题**

   ```bash
   # 修复权限
   sudo chown -R $(whoami) ~/.yarn
   ```

3. **版本冲突**
   ```bash
   # 重新安装依赖
   yarn install --force
   ```

## 📚 更多资源

- [Yarn 官方文档](https://yarnpkg.com/getting-started)
- [Yarn CLI 命令](https://yarnpkg.com/cli)
- [Yarn 迁移指南](https://yarnpkg.com/getting-started/migration)

---

🎯 **使用 Yarn 让你的开发更高效！**
