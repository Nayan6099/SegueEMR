# System Architecture - SegueEMR

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER LAYER                                │
│  ┌──────────────────┐              ┌──────────────────┐         │
│  │  Patient Portal  │              │  Doctor Portal   │         │
│  │  (Next.js App)   │              │  (Next.js App)   │         │
│  └────────┬─────────┘              └────────┬─────────┘         │
└───────────┼──────────────────────────────────┼──────────────────┘
            │                                  │
            │         HTTP/REST API            │
            └──────────────┬───────────────────┘
                           │
┌─────────────────────────▼─────────────────────────────────────────┐
│                    APPLICATION LAYER                               │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │           Backend API Server (Node.js/Express)          │     │
│  │  ┌─────────────┐  ┌──────────────┐  ┌──────────────┐   │     │
│  │  │ Controllers │  │   Services   │  │  Middleware  │   │     │
│  │  └─────────────┘  └──────────────┘  └──────────────┘   │     │
│  └─────────────────────────────────────────────────────────┘     │
└───────────┬────────────────┬─────────────────┬────────────────────┘
            │                │                 │
┌───────────▼────────────────▼─────────────────▼────────────────────┐
│                    DATA & INTEGRATION LAYER                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐           │
│  │  PostgreSQL  │  │  Azure Blob  │  │ SMART-on-FHIR│           │
│  │ (System of   │  │   (Encrypted │  │ (Interoper-  │           │
│  │   Record)    │  │ File Store)  │  │  ability)    │           │
│  └──────┬───────┘  └──────────────┘  └──────────────┘           │
│         │                                                         │
│  ┌──────▼───────┐                                                 │
│  │  MS Dataverse│                                                 │
│  │   (Directory)│                                                 │
│  └──────────────┘                                                 │
└────────────────────────────────────────────────────────────────────┘
```

---

## 🔷 Component Details

### 1. **Frontend Layer (React / Next.js)**
*   Provides role-based dashboards for patients, doctors, nurses, pharmacists, receptionists, lab techs, and administrators.
*   Interacts with the backend via REST endpoints.

### 2. **Backend Layer (Node.js/Express)**
*   **Controllers**:
    *   `ehrController.js`: Manages medical records. Coordinates file encryption, cloud upload, metadata storage, and FHIR sync.
    *   `appointmentController.js`: Handles scheduling and appointment states.
    *   `prescriptionController.js`: Manages prescription orders and dispensing actions.
    *   `labController.js`: Manages lab test orders and result uploads.
    *   `adminController.js`: Handles health check diagnostics, activity logs, and settings.
*   **Services**:
    *   `dbService.js`: Wraps around Prisma client to query and update metadata.
    *   `blobStorageService.js`: Interface to Azure Blob Storage container.
    *   `fhirService.js`: REST client for SMART-on-FHIR server integration.
    *   `dataverseService.js`: REST client for Microsoft Dataverse directory synchronization.

### 3. **Data Layer & Security Model**
*   **PostgreSQL (System of Record)**: Serves as the single source of truth. Prisma ORM maps models to tables (`users`, `patients`, `doctors`, etc.) with strict referential integrity.
*   **Off-Chain File Security (Azure Blob)**: Files are encrypted client-side using AES-256-CBC before transmission. Encryption keys and Access Control Lists (ACLs) are stored off-chain inside the relational database metadata.
*   **Directory Management (Dataverse)**: Local user, patient, and doctor creation events trigger OData updates to Dataverse entities (`systemusers`, `contacts`, `bookableresources`).
*   **clinical Data Interoperability (FHIR)**: Local write actions on appointment, lab, prescription, and record endpoints trigger non-blocking, asynchronous REST sync operations to a SMART-on-FHIR server mapping to standard resource schemas.

---

## 🔒 Security & Access Control

1.  **Encryption**:
    *   Symmetric key generated per file: `crypto.randomBytes(32)`.
    *   File payload encrypted with `aes-256-cbc` using the generated key.
    *   Encrypted payload uploaded to Azure Blob.
    *   The database record holds the path (`blobReference`) and the `encryptionKey`.
2.  **Access Verification**:
    *   Every read request checks the list of `authorizedUsers` stored in PostgreSQL metadata.
    *   Only authorized users can retrieve the file and get the encryption key necessary to decrypt it.
