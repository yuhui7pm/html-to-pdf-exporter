const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch();

  const page = await browser.newPage();
  await page.goto("https://yuhui7pm.github.io/yuhui-resume/", {
    waitUntil: "networkidle0",
  });

  await page.pdf({
    path: "example1.pdf",
    format: "A4",
    printBackground: true,
    margin: {
      top: "0",
      bottom: "0",
      left: "0",
      right: "0",
    },
  });

  await browser.close();
})();
