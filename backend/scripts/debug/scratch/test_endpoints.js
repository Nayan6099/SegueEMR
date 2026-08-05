const http = require('http');

const testEndpoint = (path) => {
  return new Promise((resolve) => {
    http.get(`http://localhost:5000${path}`, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        console.log(`\n=== PATH: ${path} ===`);
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${data}`);
        resolve();
      });
    }).on('error', (err) => {
      console.log(`Error on ${path}:`, err.message);
      resolve();
    });
  });
};

async function run() {
  await testEndpoint('/api/appointments');
  await testEndpoint('/api/intake');
  await testEndpoint('/api/patient/allergies');
}

run();
