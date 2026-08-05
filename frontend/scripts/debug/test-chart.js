const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const doctorContext = await browser.newContext();
  const doctorPage = await doctorContext.newPage();
  
  doctorPage.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
  
  try {
    console.log('Logging in Doctor...');
    await doctorPage.goto('http://localhost:3000/staff/login');
    await doctorPage.fill('input[type="text"]', 'dr.smith');
    await doctorPage.fill('input[type="password"]', 'demo');
    await doctorPage.click('button:has-text("Sign In")');
    await doctorPage.waitForTimeout(3000);
    
    console.log('Navigating to Patient Search...');
    await doctorPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const btn = btns.find(b => b.textContent.includes('Patient Search'));
      if(btn) btn.click();
    });
    await doctorPage.waitForTimeout(2000);
    
    console.log('Searching for patient...');
    await doctorPage.fill('input[placeholder*="Search patients"]', 'PAT-REAL-999-UUID');
    await doctorPage.waitForTimeout(2000);
    
    console.log('Clicking Open Chart...');
    await doctorPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const chartBtn = btns.find(b => b.textContent.includes('Open Chart'));
      if(chartBtn) chartBtn.click();
    });
    
    await doctorPage.waitForTimeout(3000);
    
    const text = await doctorPage.evaluate(() => document.body.innerText);
    if(text.includes('Office Notes')) {
      console.log('Office Notes text IS on page.');
    } else {
      console.log('Office Notes text is NOT on page.');
    }
    
    const screenshotPath = "C:\\Users\\NAYAN MISHRA\\.gemini\\antigravity-ide\\brain\\73c5cd36-995d-49c8-8177-7520517e53fa\\scratch\\doctor_chart.png";
    await doctorPage.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Screenshot taken at:', screenshotPath);
    
  } catch (err) {
    console.error('FAIL:', err);
  } finally {
    await browser.close();
  }
})();
