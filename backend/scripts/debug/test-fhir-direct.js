require("dotenv").config();
const fhirService = require("./src/services/fhirService");
async function test() {
  const appointment = {
    patientId: "PAT-002",
    doctorId: "dr.smith",
    scheduledTime: new Date().toISOString(),
    status: "scheduled"
  };
  console.log("Calling syncAppointment...");
  const res = await fhirService.syncAppointment(appointment);
  console.log("Response:", JSON.stringify(res, null, 2));
}
test();
