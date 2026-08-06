const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  let consoleErrors = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(`[Console Error] ${msg.text()}`);
      console.log(`[PAGE CONSOLE ERROR] ${msg.text()}`);
    }
  });
  
  page.on('pageerror', error => {
    consoleErrors.push(`[Page Error] ${error.message}`);
    console.log(`[PAGE EXCEPTION] ${error.message}`);
  });

  try {
    console.log('--- FLOW 1: Patient Portal ---');
    console.log('Navigating to Patient Login...');
    await page.goto('http://localhost:3000/');
    
    await page.waitForSelector('input[type="text"]');
    await page.fill('input[type="text"]', 'patient123');
    await page.fill('input[type="password"]', 'demo');
    await page.click('button[type="submit"]');
    
    console.log('Waiting for dashboard...');
    await page.waitForURL('**/dashboard/patient', { timeout: 10000 });
    console.log('✓ Successfully logged into Patient Portal');

    // Click tabs sequentially to test rendering
    const clickTab = async (text) => {
      console.log(`Clicking ${text}...`);
      // Use exact text match if possible, or substring
      await page.click(`text=${text}`);
      await page.waitForTimeout(1000); // let it render
    };

    await clickTab('Consultations');
    await clickTab('Messaging');
    await clickTab('Clinical');
    await clickTab('Reports');
    
    console.log('Logging out...');
    await page.click('text=Sign Out');
    await page.waitForURL('http://localhost:3000/', { timeout: 5000 });
    console.log('✓ Logged out of Patient Portal\n');

  } catch (err) {
    console.error('Flow 1 Failed:', err.message);
  }

  try {
    console.log('--- FLOW 2: Physician Dashboard ---');
    console.log('Navigating to Staff Login...');
    await page.goto('http://localhost:3000/staff/login');
    
    await page.waitForSelector('input[type="text"]');
    await page.fill('input[type="text"]', 'dr.smith');
    await page.fill('input[type="password"]', 'demo');
    await page.click('button[type="submit"]');
    
    console.log('Waiting for dashboard...');
    await page.waitForURL('**/dashboard/doctor', { timeout: 10000 });
    console.log('✓ Successfully logged into Doctor Dashboard');

    console.log('Finding a patient...');
    // Click the tab first
    await page.click('text=Patient Finder');
    await page.waitForTimeout(1000);
    // Type in patient finder
    await page.fill('input[placeholder*="Type patient"]', 'patient');
    await page.waitForTimeout(1500);
    // Click on the first result
    await page.click('text=patient123'); // or just click the first list item

    console.log('Opening tabs...');
    await page.waitForTimeout(1000);
    // Click Messages tab
    await page.click('text=Messages');
    await page.waitForTimeout(1000);

    console.log('Logging out...');
    await page.click('text=Sign Out');
    await page.waitForURL('http://localhost:3000/staff/login', { timeout: 5000 });
    console.log('✓ Logged out of Doctor Dashboard\n');

  } catch (err) {
    console.error('Flow 2 Failed:', err.message);
  }

  console.log('--- TEST COMPLETED ---');
  console.log(`Total console errors: ${consoleErrors.length}`);
  consoleErrors.forEach(e => console.log(e));
  
  await browser.close();
})();
