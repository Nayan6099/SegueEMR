# SegueEMR

A unified Electronic Medical Records & practice management platform. SegueEMR uses Express.js on the backend, React on the frontend, PostgreSQL (via Prisma ORM) for core operational data, Azure Blob Storage (with client-side AES-256 encryption) for file storage, and bidirectional integrations with SMART-on-FHIR and Microsoft Dataverse servers.

---

## Architectural Evolution: Blockchain (Fabric) to FHIR & Cloud Integration

In this version, SegueEMR has migrated from its legacy Hyperledger Fabric blockchain and IPFS layer to a modern, interoperable health-tech architecture:

*   **Database**: PostgreSQL replaces MongoDB/Mongoose, with **Prisma** acting as the unified ORM. All operational data (appointments, prescriptions, billing, vitals, etc.) plus new relational tables (`User`, `Patient`, `Doctor`) live here as the system of record.
*   **File Storage**: **Azure Blob Storage** replaces IPFS. Patient records are uploaded using client-side **AES-256-CBC encryption** under the naming convention `{patientId}/{recordId}_{filename}`.
*   **clinical Interoperability (SMART-on-FHIR)**: Hyperledger Fabric has been replaced by a best-effort, non-blocking **SMART-on-FHIR Integration Layer** using OAuth2 client-credentials flow.
*   **Directory Sync (Microsoft Dataverse)**: Synchronizes users, patients, and doctors to Dataverse entity sets (`systemusers`, `contacts`, `bookableresources`) asynchronously.

### Immutability vs. Interoperability Trade-off
> [!IMPORTANT]
> The original Hyperledger Fabric blockchain layer provided cryptographic tamper-evident immutability of record logs. **FHIR (Fast Healthcare Interoperability Resources) is an interoperability standard, not a replacement for blockchain-level immutability.** FHIR has no built-in tamper-evidence. To address this, PostgreSQL remains the system of record, and FHIR servers are synced as clinical destination logs. All FHIR sync calls are configured as non-blocking, best-effort processes to prevent server issues from impacting primary clinical workflows.

---

## Roles Supported

| Role | Highlights |
|------|------------|
| Patient | Upload/view own records, manage doctor access, update intake details |
| Doctor | View patient records, clinical notes, issue prescriptions, order lab tests, manage appointments |
| Nurse | Check patients in, update vitals and appointment status |
| Receptionist | Schedule/reschedule/cancel appointments, generate invoices |
| Laboratory Technician | Process lab orders, upload results |
| Pharmacist | View and dispense prescriptions |
| Administrative Staff | User management, records oversight, activity logs |
| Healthcare Management | Organization-wide analytics dashboard |

---

## Prerequisites

Before starting, ensure you have the following installed and configured:

-   **Node.js v18+**
-   **PostgreSQL** (running locally on port 5432)
-   An **Azure Storage Account** (or a local emulator like Azurite)
-   Configured environment variables for Dataverse and SMART-on-FHIR endpoints.

---

## Getting Started

### Step 1 — Clone the Repository and Install Dependencies

```bash
git clone <your-repo-url>
cd SegueEMR
```

### Step 2 — Configure Environment Variables

Create a `.env` file in the `backend/` directory based on `backend/.env.example`:

```ini
PORT=3000
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/segueemr_db?schema=public"

# Azure Blob Storage Configuration
AZURE_STORAGE_CONNECTION_STRING="UseDevelopmentStorage=true"
AZURE_STORAGE_CONTAINER_NAME="segueemr-records"

# SMART-on-FHIR Configuration
FHIR_BASE_URL="http://localhost:8080/fhir"
FHIR_TOKEN_URL="http://localhost:8080/oauth/token"
FHIR_CLIENT_ID="segueemr-client"
FHIR_CLIENT_SECRET="secure-client-secret"
FHIR_SCOPE="system/*.read system/*.write"

# Dataverse Integration Configuration
DATAVERSE_TENANT_ID="your-tenant-id"
DATAVERSE_CLIENT_ID="your-client-id"
DATAVERSE_CLIENT_SECRET="your-client-secret"
DATAVERSE_ENVIRONMENT_URL="https://your-env.crm.dynamics.com"
```

### Step 3 — Apply Database Schema and Generate Prisma Client

Execute the schema push to PostgreSQL and generate the client code:

```bash
cd backend
npx prisma db push
```

*This command automatically establishes all relations and constraints (including Patient ➔ User and Doctor ➔ User).*

### Step 4 — Run the Backend Server

```bash
npm run dev
```

The backend server will launch at `http://localhost:3000`.

### Step 5 — Run the Frontend Portal

Navigate to the frontend folder, install its packages, and run the developer server:

```bash
cd ../frontend
npm install
npm run dev
```

The application will start at `http://localhost:3000` (or `http://localhost:3001` if port 3000 is taken).

---

## Default Login Credentials

SegueEMR uses a query-param or header-based authentication simulation in development. To facilitate testing, the authentication middleware automatically populates mock records in PostgreSQL upon login.

| Role | Username / User ID | Organization |
|------|--------------------|--------------|
| Patient | patient123 | patient |
| Doctor | dr.smith | hospital |

---

## Project Structure Overview

```
SegueEMR/
├── backend/                    # Express.js API Backend
│   ├── prisma/                 # Prisma ORM Schema & Migration Logs
│   ├── src/controllers/        # Route Handlers: EHR, appointments, prescriptions, billing, admin
│   ├── src/middleware/         # Authentication & activity logger middlewares
│   ├── src/routes/             # Express API Endpoints
│   ├── src/services/           # Integration Services: Azure Blob, FHIR, Dataverse, dbService (Prisma wrapper)
│   └── server.js               # Express application boots here
├── docs/                       # Architecture & API documentation
└── frontend/                   # Next.js React Portal
```
