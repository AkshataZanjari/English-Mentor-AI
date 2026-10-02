const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  const docsDir = path.join(__dirname, '../docs/screenshots');
  if (!fs.existsSync(docsDir)){
      fs.mkdirSync(docsDir, { recursive: true });
  }

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  await page.setViewport({ width: 1280, height: 800 });

  console.log("Navigating to Home...");
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(docsDir, 'home.png') });

  console.log("Navigating to Practice Studio...");
  await page.goto('http://localhost:3000/pos', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(docsDir, 'practice-studio.png') });

  console.log("Navigating to Dashboard...");
  await page.goto('http://localhost:3000/dashboard', { waitUntil: 'networkidle2' });
  await page.screenshot({ path: path.join(docsDir, 'dashboard.png') });

  await browser.close();
  console.log("Screenshots captured successfully!");
})();
