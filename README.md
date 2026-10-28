# Polarise Telecom Technology
**Cloud Telecalling & Admissions CRM Platform**  
*Developed for Polaris Educational Consultancy*

---

## 1. Executive Summary

**Polarise Telecom Technology** is a production-grade cloud telecalling and CRM web platform engineered for educational consultancies and admissions counseling teams. It enables **10 remote telecallers** to manage assigned student inquiries, dial parents with virtual caller ID presentation, conduct inbound and outbound calls, record counseling interactions, track verified talk times (distinct from ringing duration), and log post-call dispositions.

**3 Administrators** (Super Admin, Operations Admin, and Reporting Admin) possess centralized monitoring oversight, real-time employee presence telemetry, lead allocation tools, recording vault access, and audit-ready Excel (.xlsx) / CSV export engines.

The platform includes an **Exotel telephony provider abstraction layer** designed for seamless live carrier deployment while offering an interactive **Simulated Demo Sandbox** for immediate offline evaluation and stakeholder demonstrations.

---

## 2. Default Initial Provisioned Accounts (13 Accounts)

All initial demo accounts share the demonstration password: **`Polaris@2026`**

### Administrators (3 Accounts)
| Employee ID | Name | Role | Email | PBX Extension | Responsibilities |
|---|---|---|---|---|---|
| **ADM-001** | Dr. Arvind Menon | Super Administrator | `admin1@polarisedu.in` | 100 | System control, role governance, telecalling carrier configuration |
| **ADM-002** | Pooja Sharma | Operations Administrator | `admin2@polarisedu.in` | 101 | Workforce supervision, lead allocation, live activity monitoring |
| **ADM-003** | Karthik Iyer | Reporting Administrator | `admin3@polarisedu.in` | 102 | Admissions funnel analytics, call duration metrics, Excel exports |

### Telecalling Admissions Counselors (10 Accounts)
| Employee ID | Counselor Name | Email | Assigned Forwarding Line | Extension | Desk Focus |
|---|---|---|---|---|---|
| **EMP-001** | Rohan Verma | `emp01@polarisedu.in` | `+919876543201` | 201 | Engineering & AI/ML Programs |
| **EMP-002** | Sneha Patel | `emp02@polarisedu.in` | `+919876543202` | 202 | STEM & Computing Direct Admissions |
| **EMP-003** | Ananya Rao | `emp03@polarisedu.in` | `+919876543203` | 203 | Management & Integrated BBA/MBA |
| **EMP-004** | Vikas Deshmukh | `emp04@polarisedu.in` | `+919876543204` | 204 | Medical Guidance & NEET UG / PG |
| **EMP-005** | Meera Nair | `emp05@polarisedu.in` | `+919876543205` | 205 | South India University Admissions |
| **EMP-006** | Aditya Kulkarni | `emp06@polarisedu.in` | `+919876543206` | 206 | Maharashtra & Western Zone Programs |
| **EMP-007** | Priya Sundaram | `emp07@polarisedu.in` | `+919876543207` | 207 | Overseas Guidance (US/UK/Canada) |
| **EMP-008** | Rahul Sengupta | `emp08@polarisedu.in` | `+919876543208` | 208 | North India Outreach |
| **EMP-009** | Divya Joshi | `emp09@polarisedu.in` | `+919876543209` | 209 | Allied Health & Biotechnology |
| **EMP-010** | Farhan Khan | `emp10@polarisedu.in` | `+919876543210` | 210 | Global Dual Degree Counseling |

---

## 3. Technology Stack & Architecture

- **Backend:** Python 3.12, FastAPI, SQLAlchemy 2.0, Pydantic v2, Alembic migrations, PyJWT, Bcrypt, Openpyxl.
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons.
- **Telephony Abstraction:** Exotel Call API adapter + Idempotent Webhook receiver + Demo Telephony engine generating dual-tone synthetic conversational audio (.wav).
- **Database:** SQLite for zero-setup local execution (`DATABASE_URL=sqlite:///./polarise_telecom.db`), fully switchable to PostgreSQL (`DATABASE_URL=postgresql://user:pass@host/dbname`) via environment variables.

---

## 4. Quick Start & Setup Instructions

### Prerequisites
- Python 3.12+ (Installed)
- Node.js LTS 20+ and npm (Installed)

### Step 1: Initialize Backend & Seed Database
```bash
cd backend
pip install -r requirements.txt
python seed_data.py
```

### Step 2: Launch Backend API Server
```bash
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
The FastAPI backend will be live at: `http://127.0.0.1:8000`  
Interactive Swagger API documentation: `http://127.0.0.1:8000/docs`

### Step 3: Launch Frontend Application
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
The React application will be live at: `http://127.0.0.1:5173`

---

## 5. Key System Capabilities

1. **Role-Based Routing & Security:**
   - Dedicated views for Admins (`/admin`) and Telecallers (`/`).
   - Counselors only access their assigned leads; admin pages are server-side and client-side guarded.
   - Failed login tracking (account locks after 5 attempts).
2. **True Call Duration Tracking:**
   - Ringing duration is strictly separated from Connected Talk Time.
   - Talk timer starts only upon `answered` status callback from provider.
3. **Interactive Demo Softphone & Simulator:**
   - Real-time calling modal with live timer and conversational audio waveform animations.
   - 1-Click "Simulate Incoming Call" button in top navigation to trigger inbound parent call routing.
   - In-memory synthetic WAV audio generated for demonstration recording playback.
4. **Admissions CRM Pipeline:**
   - Complete lead fields: Student Name, Parent Name, Phone, Alt Phone, Email, Location, Course Interest, Priority, Follow-up Date/Time, Notes.
   - Bulk lead allocation with audit log records.
   - Duplicate phone number warnings.
5. **Real Database Excel & CSV Reporting:**
   - Formatted `.xlsx` workbooks generated using `openpyxl` with Polaris corporate palette.
   - Separate exports for Calls, Attendance Sessions, and Leads Master Register.

---

## 6. Live Carrier Telephony (Exotel) Switch

To transition from Demo Mode to Live Exotel Telephony:
1. Navigate to **Telephony Config** in the Admin Console (`/admin/telephony`).
2. Toggle the switch to **Live Exotel Mode**.
3. Supply your **Exotel Account SID**, **API Key**, **API Token**, and **Virtual Business Caller ID**.
4. Configure your Exotel Voice Applet with the webhook endpoint: `https://<your-domain>/api/telephony/webhooks/exotel`.
