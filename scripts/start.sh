#!/bin/bash

echo "🚀 启动 HTML to PDF 服务..."

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未找到 Node.js，请先安装 Node.js (https://nodejs.org/)"
    exit 1
fi

# 检查 yarn 是否安装
if ! command -v yarn &> /dev/null; then
    echo "❌ 错误: 未找到 yarn，请先安装 yarn (https://yarnpkg.com/)"
    echo "💡 安装命令: npm install -g yarn"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo "✅ yarn 版本: $(yarn --version)"

# 安装依赖
echo "📦 安装依赖..."
yarn install

if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
fi

echo "✅ 依赖安装成功"

# 启动服务
echo "🌟 启动服务..."
yarn start 