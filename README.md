# SiddiquiSaaS Dashboard

A full-featured SaaS admin dashboard built with React, Vite, and Tailwind CSS. Includes authentication, analytics, API key management, user management, activity logs, and system settings — all powered by a mock localStorage backend.

---

## Live Demo

**GitHub Repository:** [github.com/Aishasiddiqui97/redpulse-saas-dashboard](https://github.com/Aishasiddiqui97/redpulse-saas-dashboard)

### Demo Login Credentials

| Role  | Email                  | Password    |
|-------|------------------------|-------------|
| Admin | admin@saas.com         | password123 |
| User  | user@saas.com          | password123 |

> Admin has access to the Users management page. Regular users do not.

---

## Tech Stack

| Technology       | Version  | Purpose                          |
|------------------|----------|----------------------------------|
| React            | 19.x     | UI framework                     |
| Vite             | 8.x      | Build tool & dev server          |
| Tailwind CSS     | 3.x      | Utility-first styling            |
| Framer Motion    | 12.x     | Animations & transitions         |
| React Router DOM | 7.x      | Client-side routing              |
| Recharts         | 3.x      | Charts & data visualization      |
| React Icons      | 5.x      | Icon library (Feather Icons)     |
| Axios            | 1.x      | HTTP client (mock API layer)     |

---

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Aishasiddiqui97/redpulse-saas-dashboard.git

# Navigate into the project
cd redpulse-saas-dashboard

# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

---

## Project Structure

```
src/
├── assets/              # Static images and SVGs
├── components/
│   └── Layout/
│       └── DashboardLayout.jsx   # Sidebar, header, profile dropdown
├── context/
│   ├── AuthContext.jsx            # Auth state, login/logout/signup
│   └── NotificationContext.jsx   # Notifications & toast system
├── pages/
│   ├── Auth/
│   │   ├── Login.jsx              # Login form with demo autofill
│   │   ├── Signup.jsx             # Registration with password strength meter
│   │   └── ForgotPassword.jsx     # 3-step OTP password reset
│   ├── Dashboard/
│   │   └── Overview.jsx           # Main dashboard with charts & stats
│   ├── Analytics/
│   │   └── Analytics.jsx          # Revenue, API, latency charts
│   ├── Logs/
│   │   └── ActivityLogs.jsx       # Table & timeline audit log viewer
│   ├── ApiKeys/
│   │   └── ApiKeys.jsx            # API key provisioning & management
│   ├── Users/
│   │   └── Users.jsx              # User management (admin only)
│   └── Settings/
│       └── Settings.jsx           # Profile & app configuration
├── services/
│   └── api.js                     # Mock API service with localStorage
├── App.jsx                        # Routes & route guards
├── main.jsx                       # React entry point
└── index.css                      # Global styles & Tailwind directives
```

---

## Features

### Authentication
- Login with email & password
- Signup with live password strength meter
- Forgot password with 3-step OTP flow (demo OTP: `123456`)
- Session persistence via localStorage
- Protected routes — unauthenticated users redirected to login
- Admin-only routes — non-admins redirected to dashboard

### Dashboard Overview
- Animated welcome banner with logged-in user name
- Live activity ticker with rotating system messages
- 4 stat cards: MRR, Active Subscribers, API Success Rate, Rate Limited Requests
- Area chart showing API usage and active users over time
- System health panel with endpoint ping status and progress rings (CPU, Memory, Uptime)
- Recent activity logs timeline
- Simulate Attack and Simulate Upgrade buttons for demo notifications

### Analytics
- MRR & active users area chart (6-month timeline)
- API request bar chart (delivered vs blocked/throttled)
- Endpoint consumption pie chart (microservice breakdown)
- Pipeline latency area chart
- 3 summary stat cards: MRR, Gateway Load, Average Latency

### Activity Logs
- Switch between Table view and Timeline view
- Search by action, details, or operator name
- Filter by category: Auth, API Key, Security, Settings, Admin Ops
- Inspect any log entry in a detail modal with raw JSON block
- Clear all logs button

### API Key Management
- View all provisioned API keys with usage gauges
- Create new keys with custom name and monthly request limit
- Copy key value to clipboard
- Toggle key status between active and revoked
- Delete keys permanently
- Usage capacity bar turns red when above 80%

### User Management (Admin Only)
- Search users by name or email
- Filter by role: All, Admin, User
- Promote or demote users between admin and user roles
- Block or unblock user accounts
- Self-protection: admins cannot block or demote their own account

### Settings
- **Operator Profile tab:** Edit name, email, choose from 5 avatar presets
- **Security tab:** Change password
- **Application Settings tab:** Configure global rate limit, time window, alert threshold, DDoS protection toggle, IP whitelisting toggle

### Notifications
- Bell icon in header with unread count badge
- Dropdown panel with notification list
- Mark individual or all notifications as read
- Dismiss individual notifications
- Toast notifications appear bottom-right for all actions

---

## Mock Backend (localStorage)

This project uses no real backend. All data is stored in `localStorage` under these keys:

| Key                        | Contents                        |
|----------------------------|---------------------------------|
| `saas_users`               | User accounts list              |
| `saas_api_keys`            | API keys list                   |
| `saas_activity_logs`       | Activity audit logs             |
| `saas_rate_limit_settings` | Global rate limit configuration |
| `saas_current_user`        | Active session user object      |
| `saas_auth_token`          | Active session token            |
| `saas_notifications`       | Notification list               |

Data is seeded automatically on first load if not already present.

---

## Available Scripts

| Command           | Description                        |
|-------------------|------------------------------------|
| `npm run dev`     | Start development server           |
| `npm run build`   | Build for production               |
| `npm run preview` | Preview production build locally   |
| `npm run lint`    | Run ESLint checks                  |

---

## Author

**Aisha A. Siddiqui**  
GitHub: [@Aishasiddiqui97](https://github.com/Aishasiddiqui97)
