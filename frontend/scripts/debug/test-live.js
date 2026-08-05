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
    
    console.log('Navigating to Messages...');
    await doctorPage.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const msgBtn = btns.find(b => b.textContent.includes('Messages') || b.textContent.includes('Chat'));
      if(msgBtn) msgBtn.click();
    });
    await doctorPage.waitForTimeout(2000);
    
    await doctorPage.click('text=Real Test Patient');
    await doctorPage.waitForTimeout(2000);
    
    // Patient sends message using API
    console.log('Patient logging in via API...');
    const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
      userId: 'real_patient_777',
      password: 'demo',
      role: 'patient',
      orgName: 'patient'
    });
    
    const token = loginRes.data.token;
    const patId = loginRes.data.user.patientId;
    
    const patMsg = `Live Socket Test ${Date.now()}`;
    console.log('Patient sending message via API:', patMsg);
    await axios.post('http://localhost:5000/api/patient/messages', {
      senderId: patId,
      receiverId: 'dr.smith',
      content: patMsg
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('Waiting for doctor UI to receive the live socket message without refresh...');
    await doctorPage.waitForSelector(`text=${patMsg}`, { timeout: 10000 });
    console.log('PASS: Doctor received message live!');
    
  } catch (err) {
    console.error('FAIL:', err);
  } finally {
    await browser.close();
  }
})();
