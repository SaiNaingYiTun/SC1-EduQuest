# EduQuest

EduQuest is a gamified learning platform where students complete quiz-based quests, earn XP, level up characters, and track progress while teachers manage courses and assessments through role-based dashboards.

## Features

### Student
- Role-based authentication (register/login)
- Character selection and leveling system
- Join classes using `teacher username + OTP`
- Quest board filtered by enrolled course
- Quiz quest gameplay (Phaser integration)
- XP, achievements, inventory, and leaderboard
- Profile updates and password reset via OTP email

### Teacher
- Teacher dashboard with course context filters
- Create/manage courses
- Create/edit/delete quests
- Build quizzes manually or upload via CSV
- Student overview and class analytics
- Notification center

### Admin
- Admin login and user management
- Approve/reject teacher courses
- Manage reports submitted by students
- Platform-wide moderation tools

## Tech Stack

- Frontend: React 19, Tailwind CSS, Lucide icons, Recharts
- Game Layer: Phaser 3
- Backend: Node.js, Express 5, JWT auth
- Database: MongoDB + Mongoose
- Security: bcrypt password hashing, rate limiting
- Email: SMTP (Nodemailer) or Brevo API

## Project Structure

```text
SC1-EduQuest/
  src/                 # React frontend
  public/              # Static assets, sprites, maps, sounds
  server/              # Express + MongoDB backend
  package.json         # Frontend scripts/deps
  server/package.json  # Backend scripts/deps
```

## Prerequisites

- Node.js 18+
- npm 9+
- MongoDB instance (local or Atlas)




### Vercel
- https://sc1-eduquest.vercel.app/

-Note 
Dont do forgot passwords too much cause we use brevo as free tier so limited


### GamePlay
- W - jump
- A - left
- D - right
- Enter - Attack



# SMTP mode (if MAIL_PROVIDER=smtp)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_FAMILY=4
SMTP_CONNECTION_TIMEOUT=15000
SMTP_GREETING_TIMEOUT=15000
SMTP_SOCKET_TIMEOUT=20000
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM="EduQuest <noreply@example.com>"

# Brevo mode (if MAIL_PROVIDER=brevo)
BREVO_API_KEY=your_brevo_api_key
MAIL_FROM="EduQuest <noreply@example.com>"
```

## Installation

### 1) Install frontend dependencies

```bash
npm install
```

### 2) Install backend dependencies

```bash
cd server
npm install
cd ..
```

## Running Locally

### Start backend

```bash
cd server
npm run dev
```

Backend runs on `http://localhost:5000` by default.

### Start frontend

```bash
npm start
```

Frontend runs on `http://localhost:3000`.

## First-Time Admin Setup

After backend is running and `SETUP_ADMIN_KEY` is set, create the first admin once:

```bash
curl -X POST http://localhost:5000/api/setup-admin \
  -H "Content-Type: application/json" \
  
```

Notes:
- This endpoint only works if no admin exists yet.
- Use a strong password.

## Core API Areas (High-Level)

- Auth: register, login, forgot/reset password
- Users: profile, character, user listing
- Courses: teacher CRUD, student join/remove, admin approval flow
- Quests: CRUD + course-linked questions
- Student State: progress, XP/level, inventory, achievements
- Reports/Notifications: student reporting and admin resolution workflow
- Leaderboard: per-course ranking based on level/XP

## Available Scripts

### Frontend (`/`)
- `npm start` - run React app
- `npm run build` - production build
- `npm test` - run tests

### Backend (`/server`)
- `npm run dev` - run server with nodemon
- `npm start` - run server with node



## Team Demo Flow (Suggested)

1. Teacher logs in and creates a course
2. Teacher creates a quest for that course
3. Student joins class via teacher username + OTP
4. Student completes quest and gains XP/level
5. Show leaderboard/analytics updates
6. Admin views users/courses/reports panel

---

