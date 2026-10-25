# Team Task Tracker

A MERN stack application for collaborative team task management with role-based permissions (`admin` and `member`).

## Tech Stack
- **Database**: MongoDB + Mongoose
- **Backend**: Express + Node.js (JavaScript)
- **Frontend**: React (Vite) + React Router + TailwindCSS (Phase 2+)
- **Auth**: JWT (access token 15m, refresh token 7d) + bcrypt

## Project Structure
```text
Team_task_manager/
├── server/
│   ├── models/
│   │   ├── User.js
│   │   ├── Team.js
│   │   ├── Task.js
│   │   ├── Comment.js
│   │   └── Activity.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── teams.js
│   │   └── tasks.js
│   ├── middleware/
│   │   └── auth.js
│   ├── utils/
│   │   ├── jwt.js
│   │   └── activity.js
│   ├── .env
│   ├── .env.example
│   ├── index.js
│   └── package.json
├── api.http
└── README.md
```

## Getting Started

### 1. Prerequisites
- Node.js (v18+)
- MongoDB running locally on port 27017 (or configured via `MONGO_URI` in `server/.env`)

### 2. Backend Setup
```bash
cd server
npm install
npm run dev # or npm start
```

## API Endpoints

### Authentication (`/api/auth`)
- `POST /register` - Register a new user (`name`, `email`, `password`, `role`)
- `POST /login` - Authenticate user and receive `{ accessToken, refreshToken, user }`
- `POST /refresh` - Exchange a valid `refreshToken` for a new `accessToken`
- `GET /me` - Get current authenticated user

### Teams (`/api/teams`)
- `POST /` - Create team (admin only; creator added to members)
- `GET /` - List teams the logged-in user belongs to
- `GET /:id` - Get team details with populated members (members only)
- `POST /:id/invite` - Invite existing user by email (admin + team member)
- `POST /:id/tasks` - Create a task in the team (members only)
- `GET /:id/tasks?status=` - List tasks for team with optional status filter (members only)
- `GET /:id/activity` - Get team activity timeline newest first (members only)

### Tasks & Comments (`/api/tasks`)
- `GET /:taskId` - Get task details (team members only)
- `PATCH /:taskId` - Update title, description, assignedTo, or status (team members only; logs status or update activity)
- `GET /:taskId/comments` - List comments oldest first (team members only)
- `POST /:taskId/comments` - Post comment on task (team members only)
