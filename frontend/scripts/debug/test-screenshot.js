const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();
  
  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  try {
    console.log('Logging in...');
    await page.goto('http://localhost:3000/staff/login');
    await page.fill('input[type="text"]', 'dr.smith');
    await page.fill('input[type="password"]', 'demo');
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(3000);
    
    console.log('Clicking the first Chart button in Appointments list...');
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const chartBtn = btns.find(b => b.textContent.includes('Chart') && !b.textContent.includes('Patient') && b.querySelector('svg'));
      if(chartBtn) chartBtn.click();
    });
    
    await page.waitForTimeout(3000);
    const screenshotPath = "C:\\Users\\NAYAN MISHRA\\.gemini\\antigravity-ide\\brain\\73c5cd36-995d-49c8-8177-7520517e53fa\\scratch\\patient_chart_summary.png";
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Screenshot taken at:', screenshotPath);
    console.log('DOM TEXT START\n' + await page.evaluate(() => document.body.innerText) + '\nDOM TEXT END');
    
  } catch (err) {
    console.error('FAIL:', err);
  } finally {
    await browser.close();
  }
})();
