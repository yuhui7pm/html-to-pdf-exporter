const express = require("express");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs").promises;
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");

const app = express();
const PORT = process.env.PORT || 3000;

// 安全和性能中间件
app.use(
  helmet({
    contentSecurityPolicy: false, // PDF生成需要
  })
);
app.use(compression());
app.use(cors());

// 中间件
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// 浏览器实例复用（提高性能）
let browserInstance = null;

async function getBrowser() {
  if (!browserInstance) {
    // Render.com 免费版特定配置
    const isProduction = process.env.NODE_ENV === "production";

    const launchOptions = {
      headless: true,
      // 让Puppeteer自动查找Chrome，不指定固定路径
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        // 免费版内存优化 - 更严格的限制
        "--memory-pressure-off",
        "--max_old_space_size=300",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--disable-extensions",
        "--disable-plugins",
        "--disable-default-apps",
        "--no-default-browser-check",
        ...(isProduction
          ? ["--single-process", "--disable-features=TranslateUI"]
          : []),
      ],
      // 免费版性能优化 - 减小视窗大小
      defaultViewport: {
        width: 1024,
        height: 768,
      },
      // 超时控制
      timeout: 30000,
    };

    try {
      console.log(
        "Launching browser with options:",
        JSON.stringify(launchOptions, null, 2)
      );
      browserInstance = await puppeteer.launch(launchOptions);
      console.log("Browser launched successfully");
    } catch (error) {
      console.error("Browser launch failed:", error.message);
      console.error(
        "Launch options were:",
        JSON.stringify(launchOptions, null, 2)
      );

      // 如果失败，尝试使用最基本的配置
      console.log("Retrying with minimal configuration...");
      try {
        const minimalOptions = {
          headless: true,
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
          ],
        };
        browserInstance = await puppeteer.launch(minimalOptions);
        console.log("Browser launched successfully with minimal config");
      } catch (retryError) {
        console.error("Retry also failed:", retryError.message);
        throw new Error(`Failed to launch browser: ${retryError.message}`);
      }
    }

    // 监听浏览器断开连接
    browserInstance.on("disconnected", () => {
      console.log(
        "Browser instance disconnected, will create new one on next request"
      );
      browserInstance = null;
    });

    // 免费版内存监控 - 定期检查内存使用
    setInterval(async () => {
      const usage = process.memoryUsage();
      console.log(
        "Memory usage:",
        Math.round(usage.heapUsed / 1024 / 1024) + "MB"
      );

      // 如果内存使用超过350MB，重启浏览器实例
      if (usage.heapUsed > 350 * 1024 * 1024) {
        console.log("Memory threshold exceeded, restarting browser...");
        if (browserInstance) {
          await browserInstance.close().catch(console.error);
          browserInstance = null;
        }
      }
    }, 60000); // 每分钟检查一次
  }
  return browserInstance;
}

// 根路径 - API 文档
app.get("/", (req, res) => {
  res.json({
    service: "HTML to PDF Exporter",
    version: "1.0.0",
    endpoints: {
      "POST /api/html-to-pdf": "Convert HTML content to PDF",
      "POST /api/url-to-pdf": "Convert URL to PDF",
      "POST /api/template-to-pdf": "Convert template with data to PDF",
      "GET /health": "Health check",
    },
    deployment: "Render.com Ready ✅",
  });
});

// HTML转PDF接口
app.post("/api/html-to-pdf", async (req, res) => {
  let page = null;
  try {
    const { html, options = {} } = req.body;

    if (!html) {
      return res.status(400).json({ error: "HTML content is required" });
    }

    const browser = await getBrowser();
    page = await browser.newPage();

    // Render.com 性能优化
    await page.setRequestInterception(true);
    page.on("request", (req) => {
      // 阻止不必要的资源加载
      if (req.resourceType() == "stylesheet" || req.resourceType() == "font") {
        req.continue();
      } else if (req.resourceType() == "image" && !options.includeImages) {
        req.abort();
      } else {
        req.continue();
      }
    });

    // 设置视窗大小（影响响应式布局）
    await page.setViewport({
      width: options.viewport?.width || 1280,
      height: options.viewport?.height || 800,
    });

    // 设置HTML内容
    await page.setContent(html, {
      waitUntil: ["networkidle2", "domcontentloaded"],
      timeout: 30000,
    });

    // 等待自定义字体加载
    try {
      await page.evaluateHandle("document.fonts.ready");
    } catch (e) {
      console.log("Font loading failed, continuing...");
    }

    // 模拟屏幕媒体类型（避免打印样式影响）
    await page.emulateMediaType("screen");

    // PDF生成选项
    const pdfOptions = {
      format: options.format || "A4",
      printBackground: true,
      margin: {
        top: options.margin?.top || "20px",
        right: options.margin?.right || "20px",
        bottom: options.margin?.bottom || "20px",
        left: options.margin?.left || "20px",
      },
      displayHeaderFooter: options.headerFooter?.enabled || false,
      headerTemplate: options.headerFooter?.header || "",
      footerTemplate: options.headerFooter?.footer || "",
      scale: options.scale || 1,
      preferCSSPageSize: true,
      timeout: 30000,
    };

    // 生成PDF
    const pdfBuffer = await page.pdf(pdfOptions);

    // 返回PDF文件
    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${
        options.filename || "document.pdf"
      }"`,
      "Cache-Control": "no-cache",
    });

    res.end(pdfBuffer, "binary");
  } catch (error) {
    console.error("PDF generation error:", error);
    res.status(500).json({
      error: "PDF generation failed",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  } finally {
    if (page) {
      await page.close().catch(console.error);
    }
  }
});

// URL转PDF接口
app.post("/api/url-to-pdf", async (req, res) => {
  let page = null;
  try {
    const { url, options = {} } = req.body;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

    const browser = await getBrowser();
    page = await browser.newPage();

    await page.goto(url, {
      waitUntil: "networkidle0", // 改为networkidle0，等待所有网络请求完成
      timeout: 30000,
    });

    // 等待额外的加载时间（处理懒加载内容）
    if (options.waitTime) {
      await page.waitForTimeout(Math.min(options.waitTime, 10000)); // 最大等待10秒
    }

    // 等待自定义字体加载（如果有的话）
    try {
      await page.evaluateHandle("document.fonts.ready");
    } catch (e) {
      console.log("Font loading failed, continuing...");
    }

    await page.emulateMediaType("screen");

    const pdfOptions = {
      format: options.format || "A4",
      printBackground: true,
      margin: {
        top: options.margin?.top || "20px",
        right: options.margin?.right || "20px",
        bottom: options.margin?.bottom || "20px",
        left: options.margin?.left || "20px",
      },
      scale: options.scale || 1,
      preferCSSPageSize: options.preferCSSPageSize !== false,
      timeout: 30000,
    };

    const pdfBuffer = await page.pdf(pdfOptions);

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${
        options.filename || "webpage.pdf"
      }"`,
    });

    res.end(pdfBuffer, "binary");
  } catch (error) {
    console.error("URL to PDF error:", error);
    res.status(500).json({
      error: "URL to PDF conversion failed",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  } finally {
    if (page) {
      await page.close().catch(console.error);
    }
  }
});

// 健康检查接口 - Render.com 部署必需
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
  });
});

// 模板转PDF接口（支持数据注入）
app.post("/api/template-to-pdf", async (req, res) => {
  let page = null;
  try {
    const { template, data = {}, options = {} } = req.body;

    if (!template) {
      return res.status(400).json({ error: "Template is required" });
    }

    // 简单的模板引擎（可替换为Handlebars等）
    let html = template;
    Object.keys(data).forEach((key) => {
      const regex = new RegExp(`{{${key}}}`, "g");
      html = html.replace(regex, String(data[key]));
    });

    const browser = await getBrowser();
    page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: ["networkidle2", "domcontentloaded"],
      timeout: 30000,
    });

    await page.emulateMediaType("screen");

    const pdfBuffer = await page.pdf({
      format: options.format || "A4",
      printBackground: true,
      margin: options.margin || {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
      timeout: 30000,
    });

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${
        options.filename || "template.pdf"
      }"`,
    });

    res.end(pdfBuffer, "binary");
  } catch (error) {
    console.error("Template to PDF error:", error);
    res.status(500).json({
      error: "Template to PDF conversion failed",
      details:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Internal server error",
    });
  } finally {
    if (page) {
      await page.close().catch(console.error);
    }
  }
});

// 优雅关闭 - Render.com 部署优化
const gracefulShutdown = async (signal) => {
  console.log(`Received ${signal}, shutting down gracefully...`);
  if (browserInstance) {
    await browserInstance.close();
  }
  process.exit(0);
};

process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// 未捕获的异常处理
process.on("uncaughtException", (error) => {
  console.error("Uncaught Exception:", error);
  gracefulShutdown("uncaughtException");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 HTML to PDF server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`☁️  Ready for Render.com deployment!`);
});

module.exports = app;
