const http = require("http");
const fs = require("fs").promises;

const BASE_URL = process.env.TEST_URL || "http://localhost:3000";

// 测试URL转PDF功能
async function testUrlToPdf() {
  console.log("🌐 测试 URL 转 PDF 功能...\n");

  // 测试用户的简历网站
  const resumeUrl = "https://yuhui7pm.github.io/yuhui-resume/";

  const testData = {
    url: resumeUrl,
    options: {
      format: "A4",
      margin: {
        top: "10px",
        right: "10px",
        bottom: "10px",
        left: "10px",
      },
      waitTime: 3000, // 等待3秒确保页面完全加载
      filename: "yuhui-resume.pdf",
    },
  };

  try {
    console.log(`📄 正在转换网站: ${resumeUrl}`);
    console.log("⏳ 请稍等，正在生成PDF...");

    const response = await makeRequest("POST", "/api/url-to-pdf", testData);

    if (response.headers["content-type"]?.startsWith("application/pdf")) {
      // 保存PDF文件
      const filename = "yuhui-resume.pdf";
      await fs.writeFile(filename, response.body);
      console.log("✅ URL 转 PDF 成功！");
      console.log(`📁 PDF 文件已保存: ${filename}`);
      console.log(
        `📊 PDF 大小: ${(response.body.length / 1024).toFixed(2)} KB`
      );
    } else {
      console.error("❌ 返回的不是 PDF 文件");
      console.error("实际的 Content-Type:", response.headers["content-type"]);
      console.error("响应内容:", response.body.toString());
    }
  } catch (error) {
    console.error("❌ URL 转 PDF 失败:", error.message);
  }
}

// 测试其他网站示例
async function testOtherWebsites() {
  console.log("\n🔗 测试其他网站转换...");

  const websites = [
    {
      url: "https://github.com",
      filename: "github-homepage.pdf",
    },
    {
      url: "https://www.baidu.com",
      filename: "baidu-homepage.pdf",
    },
  ];

  for (const site of websites) {
    try {
      console.log(`\n📄 转换: ${site.url}`);

      const testData = {
        url: site.url,
        options: {
          format: "A4",
          waitTime: 2000,
          filename: site.filename,
        },
      };

      const response = await makeRequest("POST", "/api/url-to-pdf", testData);

      if (response.headers["content-type"]?.startsWith("application/pdf")) {
        await fs.writeFile(site.filename, response.body);
        console.log(`✅ 成功生成: ${site.filename}`);
      }
    } catch (error) {
      console.log(`⚠️  ${site.url} 转换失败: ${error.message}`);
    }
  }
}

// HTTP请求辅助函数
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      timeout: 60000, // 增加超时时间到60秒
    };

    const req = http.request(url, options, (res) => {
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
    req.on("timeout", () => {
      req.destroy();
      reject(new Error("Request timeout"));
    });

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 主测试函数
async function runTests() {
  console.log("🧪 URL 转 PDF 测试工具\n");

  // 测试用户的简历网站
  await testUrlToPdf();

  // 可选：测试其他网站
  const testOthers = process.argv.includes("--all");
  if (testOthers) {
    await testOtherWebsites();
  }

  console.log("\n✅ 测试完成！");
  console.log("\n💡 提示:");
  console.log("- 运行 'node test-url.js --all' 测试更多网站");
  console.log("- 确保服务正在运行 (yarn dev 或 yarn start)");
}

// 运行测试
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testUrlToPdf, testOtherWebsites };
