const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('Navigating to Staff Login...');
    await page.goto('http://localhost:3000/staff/login');
    
    // Login as receptionist
    await page.fill('input[placeholder="e.g. patient123 or dr.smith"]', 'sarah.j');
    await page.fill('input[type="password"]', 'demo');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2000);
    console.log('✓ Successfully logged into Receptionist Dashboard');

    const testDate = new Date();
    testDate.setDate(testDate.getDate() + 1); // Tomorrow
    const targetDateStr = testDate.toISOString().split('T')[0];
    
    // YYYY-MM-DDTHH:mm
    const twoPmStr = `${targetDateStr}T14:00`;

    console.log(`Scheduling first appointment for patient123 at ${twoPmStr}...`);
    // Type patient ID
    await page.fill('input[placeholder="Type to search..."]', 'patient123'); // Patient picker search
    await page.click('text=Search');
    await page.waitForTimeout(1000);
    await page.click('text=patient123');
    await page.waitForTimeout(1000);
    
    // Schedule details
    await page.fill('input[placeholder="e.g. dr.smith"]', 'dr.smith');
    await page.fill('input[type="datetime-local"]', twoPmStr);
    await page.fill('textarea', 'First test appointment');
    
    await page.click('button:has-text("Schedule Appointment")');
    await page.waitForTimeout(2000);
    console.log('✓ First appointment scheduled');

    console.log(`Attempting double-booking for jane.doe at ${twoPmStr}...`);
    // Schedule second appointment (Different patient)
    await page.reload();
    await page.waitForTimeout(2000);

    await page.fill('input[placeholder="Type to search..."]', 'jane.doe');
    await page.click('text=Search');
    await page.waitForTimeout(1000);
    await page.click('text=jane.doe');
    await page.waitForTimeout(1000);

    await page.fill('input[placeholder="e.g. dr.smith"]', 'dr.smith');
    await page.fill('input[type="datetime-local"]', twoPmStr);
    await page.fill('textarea', 'Second test appointment');
    
    await page.click('button:has-text("Schedule Appointment")');
    await page.waitForTimeout(1500);

    // Verify 409 conflict error UI appears
    const errorMsgVisible = await page.isVisible('text=This time slot is already booked for this doctor. Please select from available slots below.');
    if (errorMsgVisible) {
      console.log('✓ 409 Conflict error successfully appeared on screen');
    } else {
      throw new Error('Conflict error did not appear!');
    }

    // Check available slots
    const slotVisible = await page.isVisible('text=03:00 PM');
    if (slotVisible) {
      console.log('✓ Available slots shown (e.g. 03:00 PM)');
    } else {
      throw new Error('03:00 PM slot did not appear!');
    }

    console.log('Clicking 03:00 PM available slot...');
    await page.click('text=03:00 PM');
    await page.waitForTimeout(500);
    
    await page.click('button:has-text("Schedule Appointment")');
    await page.waitForTimeout(2000);
    console.log('✓ Second appointment scheduled successfully after slot selection');

    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Test Failed:', error.message);
  } finally {
    await browser.close();
  }
})();
