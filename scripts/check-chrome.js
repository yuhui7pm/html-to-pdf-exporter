#!/usr/bin/env node

const fs = require("fs").promises;
const { execSync } = require("child_process");

async function checkChrome() {
  console.log("🔍 Checking Chrome installation...");

  const possiblePaths = [
    // Puppeteer下载的Chrome路径
    "./.cache/puppeteer/chrome/linux-*/chrome-linux64/chrome",
    // 系统Chrome路径
    "/usr/bin/google-chrome-stable",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium-browser",
    "/usr/bin/chromium",
  ];

  let foundPaths = [];

  for (const pathPattern of possiblePaths) {
    try {
      if (pathPattern.includes("*")) {
        // 使用glob模式查找
        const result = execSync(`ls ${pathPattern} 2>/dev/null || echo ""`, {
          encoding: "utf8",
        }).trim();
        if (result) {
          const paths = result.split("\n").filter((p) => p.trim());
          foundPaths.push(...paths);
          console.log(`✅ Found Chrome(s) via glob: ${paths.join(", ")}`);
        }
      } else {
        // 直接检查文件是否存在
        await fs.access(pathPattern, fs.constants.F_OK);
        foundPaths.push(pathPattern);
        console.log(`✅ Found Chrome at: ${pathPattern}`);
      }
    } catch (error) {
      console.log(`❌ Not found: ${pathPattern}`);
    }
  }

  if (foundPaths.length === 0) {
    console.log("❌ No Chrome executable found!");
    console.log(
      "🔧 Try running: npx puppeteer browsers install chrome --path ./.cache/puppeteer"
    );
    process.exit(1);
  } else {
    console.log(`✅ Total Chrome installations found: ${foundPaths.length}`);
    console.log("🎉 Chrome check passed!");
  }

  // 检查缓存目录
  try {
    const cacheDir = process.env.PUPPETEER_CACHE_DIR || "./.cache/puppeteer";
    await fs.access(cacheDir, fs.constants.F_OK);
    console.log(`✅ Cache directory exists: ${cacheDir}`);
  } catch (error) {
    console.log(
      `❌ Cache directory not found: ${
        process.env.PUPPETEER_CACHE_DIR || "./.cache/puppeteer"
      }`
    );
  }

  return foundPaths[0]; // 返回第一个找到的路径
}

if (require.main === module) {
  checkChrome().catch(console.error);
}

module.exports = checkChrome;
