const fhirService = require('../src/services/fhirService');

async function verify() {
  console.log('--- VERIFYING FHIR SYNC BEHAVIOR ---');
  
  // Set invalid/dummy FHIR URL
  process.env.FHIR_BASE_URL = 'http://localhost:9999/fhir-dummy';
  process.env.FHIR_TOKEN_URL = 'http://localhost:9999/oauth/token-dummy';
  process.env.FHIR_CLIENT_ID = 'test';
  process.env.FHIR_CLIENT_SECRET = 'test';

  console.log('Testing FHIR sync with unreachable URL...');
  
  const startTime = Date.now();
  
  try {
    // This call should be non-blocking and catch internal errors silently or return null
    const result = await fhirService.syncAppointment({
      id: 'APT-TEST',
      patientId: 'PAT-TEST',
      doctorId: 'DOC-TEST',
      scheduledTime: new Date(),
      status: 'scheduled',
      notes: 'Test sync'
    });

    const elapsed = Date.now() - startTime;
    console.log(`Sync returned: ${result} (Expected: null)`);
    console.log(`Sync time elapsed: ${elapsed}ms`);
    console.log('✓ Success: FHIR Sync did not throw any unhandled exceptions!');
  } catch (err) {
    console.error('✗ Failure: FHIR Sync threw an unhandled exception:', err.message);
  }

  process.exit(0);
}

verify();
