require("dotenv").config();
const axios = require("axios");

const BASE = "http://localhost:5000/api";

async function run() {
  // 1. Login as patient
  const patientLogin = await axios.post(BASE + "/auth/login", { userId: "real_patient_777", password: "demo", role: "patient" });
  const patientToken = patientLogin.data.token;
  const patientUser = patientLogin.data.user;
  console.log("Patient login OK | userId:", patientUser.userId, "| patientId:", patientUser.patientId);

  // 2. Login as doctor
  const doctorLogin = await axios.post(BASE + "/auth/login", { userId: "dr.smith", password: "demo", role: "doctor" });
  const doctorToken = doctorLogin.data.token;
  console.log("Doctor login OK | userId:", doctorLogin.data.user.userId);

  const patAuth = { headers: { Authorization: "Bearer " + patientToken } };
  const docAuth = { headers: { Authorization: "Bearer " + doctorToken } };

  const MSG_TEXT = "TEST_MSG_12345 - hello from patient (" + Date.now() + ")";
  const REPLY_TEXT = "TEST_REPLY_67890 - doctor reply (" + Date.now() + ")";

  // 3. Patient sends message to dr.smith
  const sendRes = await axios.post(BASE + "/patient/messages", { receiverId: "dr.smith", content: MSG_TEXT }, patAuth);
  console.log("Patient SEND result:", sendRes.data.success ? "OK" : "FAILED");

  // 4. Patient fetches thread (REST - the fix being tested)
  const patFetch = await axios.get(BASE + "/patient/messages", { ...patAuth, params: { otherId: "dr.smith" } });
  const patMsgs = patFetch.data.data || [];
  const patSentMsg = patMsgs.find(m => m.content === MSG_TEXT);
  console.log("Step 2 - Patient sees own message after REST fetch:", patSentMsg ? "YES (id=" + patSentMsg.id + ", sender_id=" + patSentMsg.sender_id + ")" : "NO - empty/missing");

  // 5. Doctor fetches the same thread  
  const docFetch = await axios.get(BASE + "/patient/messages", { ...docAuth, params: { otherId: patientUser.patientId || patientUser.userId } });
  const docMsgs = docFetch.data.data || [];
  const docSeesMsg = docMsgs.find(m => m.content === MSG_TEXT);
  console.log("Step 3 - Doctor sees patient message:", docSeesMsg ? "YES (sender_id=" + docSeesMsg.sender_id + ")" : "NO - empty/missing");
  console.log("  Doctor fetched using otherId:", patientUser.patientId || patientUser.userId);

  // 6. Doctor sends a reply
  const replyRes = await axios.post(BASE + "/patient/messages", { receiverId: patientUser.patientId || patientUser.userId, content: REPLY_TEXT }, docAuth);
  console.log("Doctor REPLY result:", replyRes.data.success ? "OK" : "FAILED");

  // 7. Patient fetches thread again to see reply
  const patFetch2 = await axios.get(BASE + "/patient/messages", { ...patAuth, params: { otherId: "dr.smith" } });
  const patMsgs2 = patFetch2.data.data || [];
  const patSeesReply = patMsgs2.find(m => m.content === REPLY_TEXT);
  console.log("Step 5 - Patient sees doctor reply:", patSeesReply ? "YES (id=" + patSeesReply.id + ", sender_id=" + patSeesReply.sender_id + ")" : "NO - empty/missing");
  console.log("  Full thread length:", patMsgs2.length, "messages");
  
  // 8. Check read receipts
  const unread = patMsgs2.filter(m => m.sender_id !== (patientUser.patientId || patientUser.userId) && !m.is_read);
  console.log("Step 6 - Unread messages from doctor:", unread.length);
  
  // Mark read
  await axios.post(BASE + "/patient/messages/read", { otherId: "dr.smith" }, patAuth);
  const patFetch3 = await axios.get(BASE + "/patient/messages", { ...patAuth, params: { otherId: "dr.smith" } });
  const afterRead = (patFetch3.data.data || []).filter(m => m.sender_id !== (patientUser.patientId || patientUser.userId) && !m.is_read);
  console.log("Step 6 - Unread from doctor AFTER marking read:", afterRead.length, "(expect 0)");
}

run().catch(e => console.error("ERROR:", e.response ? JSON.stringify(e.response.data) : e.message));

