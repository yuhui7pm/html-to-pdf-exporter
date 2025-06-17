const { join } = require("path");

/**
 * @type {import("puppeteer").Configuration}
 */
module.exports = {
  // 改变缓存目录位置
  cacheDirectory:
    process.env.PUPPETEER_CACHE_DIR || join(__dirname, ".cache", "puppeteer"),

  // 不跳过下载
  skipDownload: false,

  // 指定下载主机
  downloadHost:
    process.env.PUPPETEER_DOWNLOAD_HOST || "https://storage.googleapis.com",

  // 在生产环境中的配置
  ...(process.env.NODE_ENV === "production" && {
    cacheDirectory: "/tmp/.cache/puppeteer",
  }),
};
