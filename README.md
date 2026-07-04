# Orbit HRMS — Human Resource Management System

A full-stack HRMS web app covering authentication, role-based dashboards,
employee profiles, attendance tracking, leave/time-off management, and
payroll visibility — built from the provided SRS document and wireframes.

## Stack
- **Backend:** Node.js, Express, JWT auth, bcrypt — data stored in a local
  JSON file (`backend/db/data/hrms.json`). No native modules, no external
  database server required — installs and runs anywhere Node runs.
- **Frontend:** React (Vite), React Router, Axios.

## Project Structure
```
hrms/
  backend/          Express API (port 5000)
    db/             JSON file store + data-access helpers
    routes/         auth, users, attendance, leave, salary
    middleware/      JWT auth guard
    server.js
  frontend/         React app (port 5173)
    src/
      pages/        SignIn, SignUp, Dashboard, Employees, EmployeeProfile,
                     Attendance, TimeOff, Settings
      components/   Layout, Modal, StatusBadge, ProtectedRoute
      context/      AuthContext
      styles/       index.css
```

## Setup & Run

Open two terminals.

**1) Backend**
```bash
cd hrms/backend
npm install
npm start
```
Runs on http://localhost:5000 and seeds demo data on first run.

**2) Frontend**
```bash
cd hrms/frontend
npm install
npm run dev
```
Runs on http://localhost:5173 (proxies `/api` calls to the backend — no CORS
setup needed). Open this URL in your browser.

## Demo Accounts
| Role      | Login              | Password    |
|-----------|--------------------|-------------|
| Admin/HR  | admin@hrms.com     | Admin@123   |
| Employee  | priya.sharma@hrms.com | Welcome@123 |

You can also sign up a new account from the Sign Up page.

## Features Implemented (mapped to the SRS)

**3.1 Authentication & Authorization**
- Sign up (name, email, password, role) and sign in with clear error messages.
- Passwords hashed with bcrypt; JWT session tokens.
- Admin-created employees get an auto-generated Login ID
  (`OI` + initials + join year + serial, e.g. `OIJODO20220001`) and a
  temporary password they must change on first login.

**3.2 Dashboard**
- Employee: quick-access cards (Profile, Attendance, Leave Requests,
  Settings), check-in/out widget, time-off balance summary.
- Admin/HR: employee grid with live attendance-status dot (🟢 present,
  ✈️ on leave, 🟡 absent), clickable through to each profile.

**3.3 Employee Profile Management**
- View/Edit tabs: Profile, Private Info, Salary Info, Resume & Skills.
- Employees can edit limited fields (phone, address, personal email, about,
  skills); Admin can edit everything.

**3.4 Attendance Management**
- Check-in / Check-out with automatic work-hours and extra-hours calculation.
- Employees see their own day-wise attendance by month; Admin sees all
  employees for any selected date.

**3.5 Leave & Time-Off Management**
- Apply for Paid / Sick / Unpaid leave with a date range and remarks.
- Status flow: Pending → Approved/Rejected, with an HR comment.
- Leave balances (Paid/Sick days available) auto-adjust on approval.

**3.6 Payroll / Salary Management**
- Employees get a read-only payroll breakdown (Basic, HRA, Standard
  Allowance, Performance Bonus, LTA, Fixed Allowance, PF, Professional Tax,
  Net Pay).
- Admin can edit the wage and every component percentage; components
  recompute automatically (e.g. Wage ₹50,000 → Basic ₹25,000 → HRA ₹12,500).

## Notes
- Data persists in `backend/db/data/hrms.json`. Delete that file to reset to
  a clean, re-seeded state.
- Email verification and file uploads (resume, profile picture, leave
  attachment) are represented as placeholders/URLs rather than real file
  storage, since no file-storage backend was specified in the SRS.
