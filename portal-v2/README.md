# ⚡ InternHub v2 — Advanced Internship Portal

## New Features vs Basic Version

| Feature | Basic | InternHub v2 |
|---|---|---|
| Search & Filter | Basic | Smart search with keyword, location, category, stipend, remote |
| Application Status | 3 statuses | 7 statuses with visual progress bar |
| Email OTP Verification | ✗ | ✅ |
| Forgot/Reset Password | ✗ | ✅ |
| Bookmarked Internships | ✗ | ✅ |
| Notifications | ✗ | ✅ Real-time bell with badge |
| Interview Scheduling | ✗ | ✅ Admin schedules with email |
| Cover Letter | ✗ | ✅ |
| Company Reviews & Ratings | ✗ | ✅ |
| Profile Completion Meter | ✗ | ✅ |
| Skills, LinkedIn, GitHub fields | ✗ | ✅ |
| View / Application Count | ✗ | ✅ |
| Apply Deadline with urgency | ✗ | ✅ |
| Admin Edit Internship | ✗ | ✅ |
| Admin Ban/Unban Users | ✗ | ✅ |
| Doughnut + Bar Charts | Bar only | ✅ Both |
| Dark Theme UI | Light | ✅ Full dark |
| Landing Page | ✗ | ✅ |
| Category tabs | ✗ | ✅ |
| Withdraw Application | ✗ | ✅ |

---

## Setup (same as before)

### 1. MySQL
```sql
CREATE DATABASE internship_portal_v2;
```

### 2. Backend in IntelliJ
1. Open `backend/` folder as Maven project
2. Edit `src/main/resources/application.properties`:
   - `spring.datasource.password=YOUR_PASSWORD`
   - `spring.mail.username=YOUR_GMAIL`
   - `spring.mail.password=YOUR_APP_PASSWORD` (Gmail App Password)
3. Mark `src/main/java` as Sources Root
4. Run `PortalApplication.java`
5. Runs on **http://localhost:8081**

> **Note:** Gmail App Password — go to Google Account → Security → 2-Step Verification → App Passwords

### 3. Frontend
```bash
cd frontend
npm install
npm start
```
Runs on **http://localhost:3000**

---

## API Reference

### Auth
| Method | URL | Description |
|---|---|---|
| POST | /api/auth/register | Register (sends OTP email) |
| POST | /api/auth/verify-otp | Verify email OTP |
| POST | /api/auth/login | Login |
| POST | /api/auth/forgot-password | Send reset OTP |
| POST | /api/auth/reset-password | Reset with OTP |

### Internships
| Method | URL | Description |
|---|---|---|
| GET | /api/internships/all | All active internships |
| GET | /api/internships/latest | Latest 5 |
| GET | /api/internships/search | Search with filters |
| GET | /api/internships/{id} | Detail (increments view count) |
| POST | /api/internships/add | Add (Admin) |
| PUT | /api/internships/update/{id} | Edit (Admin) |
| DELETE | /api/internships/delete/{id} | Delete (Admin) |
| POST | /api/internships/bookmark | Toggle bookmark |
| GET | /api/internships/saved/{email} | Get saved list |

### Applications
| Method | URL | Description |
|---|---|---|
| POST | /api/applications/apply | Apply with cover letter |
| GET | /api/applications/all | All (Admin) |
| GET | /api/applications/student/{email} | Student's applications |
| PUT | /api/applications/status/{id} | Update status (Admin) |
| POST | /api/applications/interview/{id} | Schedule interview |
| PUT | /api/applications/withdraw/{id} | Student withdraw |
| GET | /api/applications/analytics | Stats for charts |

### Users, Notifications, Reviews
- PUT /api/users/update — update profile
- POST /api/users/upload-resume — upload PDF
- POST /api/users/upload-photo — upload photo
- PUT /api/users/ban/{id} — ban/unban user
- GET /api/notifications/{email} — get notifications
- PUT /api/notifications/mark-read/{email} — mark all read
- POST /api/reviews/add — add company review
- GET /api/reviews/company/{name} — get company reviews

---

## Application Status Flow
```
APPLIED → UNDER_REVIEW → SHORTLISTED → INTERVIEW_SCHEDULED → ACCEPTED
                                                            → REJECTED
(Student can WITHDRAW at any time from APPLIED status)
```

## Test Credentials (register these first)
| Role | Email | Password |
|---|---|---|
| Admin | admin@internhub.com | admin123 |
| Student | student@internhub.com | student123 |





## 🚀 Advanced Features (InternHub v2)

### 🔐 Security
- Two-Factor Authentication (2FA)
- Login History Tracking
- Account Deletion Request System
- JWT with Remember Me (30 days)

### 🤖 AI Features
- AI Cover Letter Generator
- AI Interview Preparation System
- AI Job Match Score
- AI Chatbot Assistant
- Resume Parser (Auto-fill Profile)

### 📱 Advanced Capabilities
- Firebase Push Notifications (FCM ready)
- Offline Mode Support
- React Native Mobile App Ready