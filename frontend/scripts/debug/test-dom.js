const { chromium } = require('playwright');
const axios = require('axios');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const doctorContext = await browser.newContext();
  const doctorPage = await doctorContext.newPage();
  
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
      const btn = btns.find(b => b.textContent.includes('Patient Search') || b.textContent.includes('Patients'));
      if(btn) btn.click();
    });
    await doctorPage.waitForTimeout(2000);
    
    console.log('Clicking Open Chart...');
    await doctorPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const chartBtn = btns.find(b => b.textContent.includes('Open Chart') || b.textContent.includes('Chart'));
      if(chartBtn) chartBtn.click();
    });
    
    await doctorPage.waitForTimeout(4000);
    
    const html = await doctorPage.content();
    if(html.includes('Notes') && html.includes('Education')) {
      console.log('PASS: "Notes" and "Education" ARE in the DOM!');
    } else {
      console.log('FAIL: Tabs are NOT in the DOM!');
    }
    
    // Dump all button text to see what tabs actually rendered
    const btns = await doctorPage.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).map(b => b.textContent).filter(t => t);
    });
    console.log('Buttons found on screen:', btns);
    
  } catch (err) {
    console.error('FAIL:', err);
  } finally {
    await browser.close();
  }
})();
