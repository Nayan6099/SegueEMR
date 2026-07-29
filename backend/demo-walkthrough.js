const axios = require('axios');

const BASE_URL = 'http://localhost:5000/api';

async function login(userId, role, password = 'demo') {
    const res = await axios.post(`${BASE_URL}/auth/login`, { userId, password, role, orgName: 'DemoOrg' });
    return res.data.token;
}

async function runDemo() {
    try {
        console.log('--- RECEPTIONIST FLOW ---');
        const recToken = await login('receptionist1', 'receptionist');
        console.log('✅ Receptionist logged in');
        
        const intakeRes = await axios.post(`${BASE_URL}/intake`, {
            name: 'Demo Walkthrough Patient',
            dateOfBirth: '1980-05-15',
            gender: 'Female',
            contactPhone: '555-9999',
            reasonForVisit: 'Headache'
        }, { headers: { Authorization: `Bearer ${recToken}` } });
        const patientId = intakeRes.data.data.patientId;
        console.log('✅ Patient Registered & Checked In:', patientId);

        console.log('\n--- DOCTOR FLOW ---');
        const docToken = await login('dr.smith', 'doctor');
        console.log('✅ Doctor logged in');
        
        await axios.post(`${BASE_URL}/clinical-notes`, {
            patientId,
            appointmentId: 'APP-DUMMY',
            soapSubjective: 'Patient complains of headache',
            soapObjective: 'Normal vitals',
            soapAssessment: 'Tension headache',
            soapPlan: 'Rest and hydration'
        }, { headers: { Authorization: `Bearer ${docToken}` } });
        console.log('✅ Clinical Note Added');

        const labRes = await axios.post(`${BASE_URL}/lab/orders`, {
            patientId,
            patientName: 'Demo Walkthrough Patient',
            testName: 'Complete Blood Count',
            notes: 'Check for infection'
        }, { headers: { Authorization: `Bearer ${docToken}` } });
        const labOrderId = labRes.data.data.id;
        console.log('✅ Lab Order Created:', labOrderId);

        const rxRes = await axios.post(`${BASE_URL}/prescriptions`, {
            patientId,
            patientName: 'Demo Walkthrough Patient',
            medications: [{ name: 'Paracetamol 500mg', dosage: '1 tablet', frequency: 'twice a day', duration: '3 days' }]
        }, { headers: { Authorization: `Bearer ${docToken}` } });
        const rxId = rxRes.data.data.id;
        console.log('✅ Prescription Created:', rxId);

        console.log('\n--- LAB TECHNICIAN FLOW ---');
        const labToken = await login('labtech1', 'lab_technician');
        console.log('✅ Lab Technician logged in');
        
        await axios.put(`${BASE_URL}/lab/orders/${labOrderId}/status`, {
            status: 'completed',
            resultSummary: 'Normal'
        }, { headers: { Authorization: `Bearer ${labToken}` } });
        console.log('✅ Lab Order marked as completed');

        console.log('\n--- PHARMACIST FLOW ---');
        const pharmToken = await login('pharmacist1', 'pharmacist');
        console.log('✅ Pharmacist logged in');
        
        await axios.put(`${BASE_URL}/prescriptions/${rxId}/dispense`, {
            status: 'dispensed'
        }, { headers: { Authorization: `Bearer ${pharmToken}` } });
        console.log('✅ Prescription marked as dispensed');

        console.log('\n🎉 ALL WORKFLOWS COMPLETED SUCCESSFULLY!');
    } catch (e) {
        console.error('❌ WORKFLOW FAILED:');
        console.error(e.response ? JSON.stringify(e.response.data, null, 2) : e);
    }
}

runDemo();
