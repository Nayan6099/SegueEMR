require("dotenv").config();
const axios = require("axios");
const BASE = "http://localhost:5000/api";

async function run() {
  // 1. Login as patient123 via demo bypass (same as browser would do)
  let res;
  try {
    res = await axios.post(BASE + "/auth/login", { userId: "patient123", password: "demo", role: "patient" });
  } catch(e) {
    console.error("patient123 login FAILED:", e.response?.data);
    return;
  }
  const p = res.data;
  const patientUser = p.user;
  const patientToken = p.token;
  console.log("=== patient123 JWT payload ===");
  console.log("  userId:    ", patientUser.userId);
  console.log("  patientId: ", patientUser.patientId, "(CRITICAL: null means messages will be keyed by userId)");
  console.log("  role:      ", patientUser.role);

  // 2. Compare real_patient_777
  let res2;
  try {
    res2 = await axios.post(BASE + "/auth/login", { userId: "real_patient_777", password: "demo", role: "patient" });
    const p2 = res2.data.user;
    console.log("\n=== real_patient_777 JWT payload ===");
    console.log("  userId:    ", p2.userId);
    console.log("  patientId: ", p2.patientId);
    console.log("  role:      ", p2.role);
  } catch(e) {
    console.log("real_patient_777 login:", e.response?.data?.message || e.message);
  }

  // 3. Check what Patient DB record patient123 resolves to
  console.log("\n=== patient123 DB lookup (via prisma) ===");
  const prisma = require("./src/config/prisma");
  const byId   = await prisma.patient.findUnique({ where: { id: "patient123" } }).catch(() => null);
  const byUid  = await prisma.patient.findFirst({ where: { userId: "patient123" } }).catch(() => null);
  const byName = await prisma.patient.findFirst({ where: { name: { contains: "patient123", mode: "insensitive" } } }).catch(() => null);
  console.log("  patient where id=patient123:     ", byId ? `FOUND id=${byId.id} userId=${byId.userId}` : "NOT FOUND");
  console.log("  patient where userId=patient123: ", byUid ? `FOUND id=${byUid.id} userId=${byUid.userId}` : "NOT FOUND");
  console.log("  patient where name~=patient123:  ", byName ? `FOUND id=${byName.id} name=${byName.name}` : "NOT FOUND");

  // 4. Run same message test as before using patient123
  console.log("\n=== MESSAGE FLOW TEST with patient123 ===");
  const patAuth = { headers: { Authorization: "Bearer " + patientToken } };

  const doctorLogin = await axios.post(BASE + "/auth/login", { userId: "dr.smith", password: "demo", role: "doctor" });
  const doctorToken = doctorLogin.data.token;
  const docUser = doctorLogin.data.user;
  const docAuth = { headers: { Authorization: "Bearer " + doctorToken } };
  console.log("Doctor userId:", docUser.userId, "patientId:", docUser.patientId);

  const MSG = "P123_TEST_" + Date.now();

  // Send from patient123
  const sendRes = await axios.post(BASE + "/patient/messages", { receiverId: "dr.smith", content: MSG }, patAuth).catch(e => ({ data: { success: false, err: e.response?.data } }));
  console.log("SEND result:", sendRes.data);

  // Patient123 fetches thread
  const patFetch = await axios.get(BASE + "/patient/messages", { ...patAuth, params: { otherId: "dr.smith" } }).catch(e => ({ data: { data: [] } }));
  const patMsgs = patFetch.data.data || [];
  const found = patMsgs.find(m => m.content === MSG);
  console.log("Patient sees own sent message (Step 2):", found ? `YES sender_id=${found.sender_id}` : "NO - not in thread");
  console.log("  Thread length:", patMsgs.length, "messages");
  if (patMsgs.length > 0) {
    console.log("  First msg sender_id:", patMsgs[0].sender_id, "| receiver_id:", patMsgs[0].receiver_id);
  }

  // Doctor fetches thread using patientId (from JWT)
  const otherId = patientUser.patientId || patientUser.userId;
  const docFetch = await axios.get(BASE + "/patient/messages", { ...docAuth, params: { otherId } }).catch(e => ({ data: { data: [] } }));
  const docMsgs = docFetch.data.data || [];
  const docFound = docMsgs.find(m => m.content === MSG);
  console.log("Doctor sees message (Step 3): using otherId=" + otherId + ":", docFound ? `YES sender_id=${docFound.sender_id}` : "NO - not found");
  console.log("  Doctor thread length:", docMsgs.length);

  await prisma.$disconnect();
}

run().catch(e => console.error("FATAL:", e.message));

