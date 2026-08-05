require("dotenv").config();
const axios = require("axios");
const fhirService = require("./src/services/fhirService");

async function test() {
  try {
    // 1. Create a Patient on HAPI directly
    console.log("Creating dummy Patient on HAPI FHIR...");
    const pRes = await axios.post("https://hapi.fhir.org/baseR4/Patient", {
      resourceType: "Patient",
      name: [{ given: ["Test"], family: "Integration" }]
    });
    const patientId = pRes.data.id;
    console.log("Created Patient ID on HAPI:", patientId);

    // 2. Create a Practitioner on HAPI directly
    console.log("Creating dummy Practitioner on HAPI FHIR...");
    const docRes = await axios.post("https://hapi.fhir.org/baseR4/Practitioner", {
      resourceType: "Practitioner",
      name: [{ given: ["Dr"], family: "Smith" }]
    });
    const doctorId = docRes.data.id;
    console.log("Created Practitioner ID on HAPI:", doctorId);

    // 3. Test our backend syncAppointment
    console.log("\nCalling SegueEMR syncAppointment...");
    const appointment = {
      patientId: patientId,
      doctorId: doctorId,
      scheduledTime: new Date().toISOString(),
      status: "scheduled"
    };
    
    const res = await fhirService.syncAppointment(appointment);
    console.log("Response from our fhirService:\n", JSON.stringify(res, null, 2));
  } catch (err) {
    console.error("Error:", err.response ? err.response.data : err.message);
  }
}
test();
