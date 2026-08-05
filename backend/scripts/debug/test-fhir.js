const axios = require("axios");
async function test() {
  try {
    const login = await axios.post("http://localhost:5000/api/auth/login", { userId: "dr.smith", password: "demo", role: "doctor" });
    const token = login.data.token;
    console.log("Got token");
    const res = await axios.post("http://localhost:5000/api/appointments", {
      patientId: "PAT-002",
      patientName: "John Doe",
      doctorId: "dr.smith",
      scheduledTime: new Date().toISOString()
    }, { headers: { Authorization: "Bearer " + token } });
    console.log("Created appointment", res.data.data.id);
  } catch (err) {
    console.error(err.response ? err.response.data : err.message);
  }
}
test();
