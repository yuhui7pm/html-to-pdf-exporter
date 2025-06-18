const http = require("http");
const https = require("https");
const fs = require("fs").promises;

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

// 测试函数
async function testAPI() {
  console.log("🧪 开始测试 HTML to PDF API...\n");

  // 1. 健康检查测试
  await testHealthCheck();

  // 2. HTML转PDF测试
  await testHtmlToPdf();

  // 3. URL转PDF测试
  await testUrlToPdf();

  // 4. 模板转PDF测试
  await testTemplateToPdf();

  console.log("\n✅ 所有测试完成！");
}

// 健康检查测试
async function testHealthCheck() {
  console.log("📊 测试健康检查...");
  try {
    const response = await makeRequest("GET", "/health");
    console.log("✅ 健康检查通过:", response.status);
  } catch (error) {
    console.error("❌ 健康检查失败:", error.message);
  }
}

// HTML转PDF测试
async function testHtmlToPdf() {
  console.log("\n📄 测试 HTML 转 PDF...");

  const testData = {
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          .header { color: #333; border-bottom: 2px solid #007acc; padding-bottom: 10px; }
          .content { margin-top: 20px; line-height: 1.6; }
          .highlight { background: #f0f8ff; padding: 10px; border-left: 4px solid #007acc; }
        </style>
      </head>
      <body>
        <h1 class="header">PDF 生成测试</h1>
        <div class="content">
          <p>这是一个测试文档，用于验证 HTML 转 PDF 功能。</p>
          <div class="highlight">
            <p><strong>重要提示：</strong>此服务已成功部署到 Render.com！</p>
          </div>
          <ul>
            <li>支持复杂的 CSS 样式</li>
            <li>支持中文字符</li>
            <li>支持响应式设计</li>
          </ul>
        </div>
      </body>
      </html>
    `,
    options: {
      format: "A4",
      margin: {
        top: "20px",
        right: "20px",
        bottom: "20px",
        left: "20px",
      },
      filename: "test-document.pdf",
    },
  };

  try {
    const response = await makeRequest("POST", "/api/html-to-pdf", testData);
    if (response.headers["content-type"]?.startsWith("application/pdf")) {
      // 保存PDF文件
      const filename = "test-html-to-pdf.pdf";
      await fs.writeFile(filename, response.body);
      console.log(
        "✅ HTML 转 PDF 成功！PDF 大小:",
        response.body.length,
        "bytes"
      );
      console.log("📁 PDF 文件已保存:", filename);
    } else {
      console.error("❌ 返回的不是 PDF 文件");
      console.error("实际的 Content-Type:", response.headers["content-type"]);
    }
  } catch (error) {
    console.error("❌ HTML 转 PDF 失败:", error.message);
  }
}

// URL转PDF测试
async function testUrlToPdf() {
  console.log("\n🌐 测试 URL 转 PDF...");

  const testData = {
    url: "https://yuhui7pm.github.io/yuhui-resume/",
    options: {
      format: "A4",
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    },
  };

  try {
    const response = await makeRequest("POST", "/api/url-to-pdf", testData);
    if (response.headers["content-type"]?.startsWith("application/pdf")) {
      // 保存PDF文件
      const filename = "test-url-to-pdf" + Date.now() + ".pdf";
      await fs.writeFile(filename, response.body);
      console.log(
        "✅ URL 转 PDF 成功！PDF 大小:",
        response.body.length,
        "bytes"
      );
      console.log("📁 PDF 文件已保存:", filename);
      console.log("🔗 源URL:", testData.url);
    } else {
      console.error("❌ 返回的不是 PDF 文件");
      console.error("实际的 Content-Type:", response.headers["content-type"]);
    }
  } catch (error) {
    console.error("❌ URL 转 PDF 失败:", error.message);
  }
}

// 模板转PDF测试
async function testTemplateToPdf() {
  console.log("\n📋 测试模板转 PDF...");

  const testData = {
    template: `
      <html>
      <body style="font-family: Arial; margin: 30px;">
        <h1>{{title}}</h1>
        <p>生成时间: {{date}}</p>
        <p>用户: {{username}}</p>
        <div style="background: #f5f5f5; padding: 15px; margin: 20px 0;">
          <h3>统计信息</h3>
          <p>总访问量: {{totalViews}}</p>
          <p>今日访问: {{todayViews}}</p>
        </div>
      </body>
      </html>
    `,
    data: {
      title: "月度报告",
      date: new Date().toLocaleString("zh-CN"),
      username: "测试用户",
      totalViews: "1,234",
      todayViews: "56",
    },
    options: {
      filename: "monthly-report.pdf",
    },
  };

  try {
    const response = await makeRequest(
      "POST",
      "/api/template-to-pdf",
      testData
    );
    if (response.headers["content-type"]?.startsWith("application/pdf")) {
      // 保存PDF文件
      const filename = "test-template-to-pdf.pdf";
      await fs.writeFile(filename, response.body);
      console.log(
        "✅ 模板转 PDF 成功！PDF 大小:",
        response.body.length,
        "bytes"
      );
      console.log("📁 PDF 文件已保存:", filename);
    } else {
      console.error("❌ 返回的不是 PDF 文件");
      console.error("实际的 Content-Type:", response.headers["content-type"]);
    }
  } catch (error) {
    console.error("❌ 模板转 PDF 失败:", error.message);
  }
}

// HTTP/HTTPS请求辅助函数
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    // 根据协议选择http或https模块
    const client = url.protocol === "https:" ? https : http;
    const req = client.request(url, options, (res) => {
      let body = [];

      res.on("data", (chunk) => {
        body.push(chunk);
      });

      res.on("end", () => {
        const responseBody = Buffer.concat(body);

        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: responseBody,
          });
        } else {
          reject(
            new Error(`HTTP ${res.statusCode}: ${responseBody.toString()}`)
          );
        }
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 运行测试
if (require.main === module) {
  testAPI().catch(console.error);
}

module.exports = { testAPI };
