const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Logging in as real_patient_777...');
    await page.goto('http://localhost:3000');
    await page.fill('input[type="text"]', 'real_patient_777');
    await page.fill('input[type="password"]', 'demo');
    await page.click('button:has-text("Sign In")');
    await page.waitForTimeout(3000);
    console.log('Logged in.');

    // Function to check a tab
    async function checkTab(tabName, expectedText) {
      console.log(`Checking ${tabName} tab...`);
      await page.evaluate((name) => {
        const btns = Array.from(document.querySelectorAll('button'));
        const btn = btns.find(b => b.textContent.includes(name));
        if (btn) btn.click();
      }, tabName);
      await page.waitForTimeout(2000);
      const text = await page.textContent('body');
      if (text.includes(expectedText)) {
        console.log(`PASS: ${tabName} data loaded.`);
      } else {
        console.error(`FAIL: ${tabName} data not found. Looked for "${expectedText}"`);
      }
    }

    await checkTab('Appointments', 'Checkup for real user');
    await checkTab('Prescriptions', 'Testosterone');
    await checkTab('Lab Orders', 'Blood Test');
    await checkTab('Clinical Health', 'Peanuts');
    
  } catch (err) {
    console.error('Test failed:', err);
  } finally {
    await browser.close();
  }
})();
