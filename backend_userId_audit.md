# Backend `req.user.userId` Audit Report

This report analyzes every occurrence of `req.user.userId` across the `backend/src` directory, specifically looking for places where it is used in a patient-specific context and evaluating whether it should be changed to `req.user.patientId || req.user.userId`.

---

## 🔴 High-Confidence Fixes (Should be Changed)

### 1. `src/routes/ehrRoutes.js`
*   **Line:** 99
*   **Context:** `DELETE /api/ehr/delete/:recordId` route.
*   **Snippet:**
    ```javascript
        const { recordId } = req.params;
        const userId = req.user.userId;
        const role = req.user.role;
        // ...
        } else if (role === 'patient') {
          isOwner = (record.patientId === userId);
        }
    ```
*   **Analysis:** This code is performing an ownership check for patients trying to delete their own EHR records. It checks if `record.patientId` (which maps to the `Patient.id` UUID) is equal to `userId` (which maps to the authentication `User.id`). These are NOT interchangeable.
*   **Recommendation:** Change to `const userId = req.user.patientId || req.user.userId;` OR update the condition to `isOwner = (record.patientId === req.user.patientId);`.

---

## 🟡 Medium-Confidence Flags / Interoperability Assumptions

### 1. `src/controllers/labController.js`
*   **Line:** 600
*   **Context:** `viewEHR` (or `downloadReport` equivalent in labController) authorization fallback.
*   **Snippet:**
    ```javascript
        // Fallback: check DB patient record's userId
        const patientRecord = await prisma.patient.findFirst({
            where: { userId: req.user.userId }
        });
    ```
*   **Analysis:** If a patient logs in but their JWT is somehow missing the `patientId` claim, this code attempts to manually link the user to a patient record by querying the database for a `Patient` where the `userId` field matches the `req.user.userId`.
*   **Recommendation:** This explicitly derives the `patientId` from the `userId`. It is logically sound given the database schema (`Patient.userId` links to `User.id`), but it acts as a silent fallback that might mask JWT payload generation issues. It is technically correct, but worth flagging as an explicit derivation point.

---

## 🟢 Low-Confidence / "Probably Fine" (Already Fixed or Correctly Used)

### 1. Already Fixed (Using `req.user.patientId || req.user.userId`)
These locations have already been patched with the exact fix you suggested earlier, handling both roles correctly:
*   `src/controllers/appointmentController.js` (lines 76, 171)
*   `src/controllers/patientPortalController.js` (lines 122, 139, 163, 348)
*   `src/controllers/prescriptionController.js` (line 209)

### 2. Genuinely Correct (Staff, Admin, or System Contexts)
The vast majority of `req.user.userId` usages in the backend are correctly tracking the staff member who performed an action. None of these should be changed to `patientId`:
*   **Clinical Notes:** `src/controllers/clinicalNoteController.js` (line 30) — Sets `recordedBy` to the doctor's `userId`.
*   **Lab Orders:** `src/controllers/labController.js` (lines 110, 136, 178, 455) — Sets `processedBy` to the lab tech's `userId`. Lines 612, 667 log the audit action `userId`. Line 237 queries for labs assigned to `assignedLabId: req.user.userId`.
*   **Notifications:** `src/controllers/notificationController.js` (lines 6, 31, 49, 81) — Queries or sets the `userId` for notifications, which are mapped to the authentication `User` entity, not the `Patient` entity.
*   **Recalls:** `src/controllers/recallController.js` (lines 26, 61, 112) — Fallback used to identify the `doctorId`.
*   **Vitals:** `src/controllers/vitalsController.js` (line 8) — Sets `recordedBy` to the staff member's `userId`.
*   **Intakes:** `src/controllers/intakeController.js` (lines 205, 378) — Fallback for `doctorId`. Line 239 uses it for `changedBy`.
*   **EHR:** `src/controllers/ehrController.js` (line 87) — Sets `uploadedBy`. Lines 164, 216, 403 use `userId` to check `metadata.authorizedUsers.includes(userId)`. Since `authorizedUsers` stores the `User.id`, this is perfectly correct.
*   **Billing:** `src/controllers/billingController.js` (lines 37, 84) — Sets `createdBy` and `updatedBy`.
