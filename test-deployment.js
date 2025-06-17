const https = require("https");

const BASE_URL = "https://html-to-pdf-exporter.onrender.com";

// 简单的请求函数
function makeRequest(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      method,
      headers: {
        "Content-Type": "application/json",
      },
    };

    const req = https.request(url, options, (res) => {
      let body = [];

      res.on("data", (chunk) => {
        body.push(chunk);
      });

      res.on("end", () => {
        const responseBody = Buffer.concat(body);
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: responseBody,
        });
      });
    });

    req.on("error", reject);

    if (data) {
      req.write(JSON.stringify(data));
    }

    req.end();
  });
}

// 快速测试函数
async function quickTest() {
  console.log("🚀 开始快速测试部署的API...\n");

  // 1. 健康检查
  try {
    console.log("📊 测试健康检查...");
    const health = await makeRequest("GET", "/health");
    if (health.status === 200) {
      console.log("✅ 健康检查成功");
      const healthData = JSON.parse(health.body.toString());
      console.log(
        `   内存使用: ${Math.round(healthData.memory.heapUsed / 1024 / 1024)}MB`
      );
      console.log(`   运行时间: ${Math.round(healthData.uptime)}秒`);
    } else {
      console.log("❌ 健康检查失败:", health.status);
    }
  } catch (error) {
    console.log("❌ 健康检查错误:", error.message);
  }

  // 2. 简单HTML测试
  try {
    console.log("\n📄 测试简单HTML转PDF...");
    const simpleHtml = {
      html: `<html><body style="font-family: Arial; padding: 20px;">
        <h1 style="color: #333;">测试成功！</h1>
        <p>这是一个简单的PDF生成测试。</p>
        <p>时间: ${new Date().toLocaleString("zh-CN")}</p>
      </body></html>`,
      options: {
        filename: "simple-test.pdf",
      },
    };

    const result = await makeRequest("POST", "/api/html-to-pdf", simpleHtml);

    if (
      result.status === 200 &&
      result.headers["content-type"]?.includes("application/pdf")
    ) {
      console.log("✅ HTML转PDF成功！");
      console.log(`   PDF大小: ${Math.round(result.body.length / 1024)}KB`);
    } else {
      console.log("❌ HTML转PDF失败:", result.status);
      console.log("   响应内容:", result.body.toString());
    }
  } catch (error) {
    console.log("❌ HTML转PDF错误:", error.message);
  }

  console.log("\n🏁 测试完成！");
}

// 运行测试
if (require.main === module) {
  quickTest().catch(console.error);
}

module.exports = { quickTest };
