# Team Task Tracker

A MERN stack application for collaborative team task management with role-based permissions (`admin` and `member`) and a real-time activity timeline.

## Tech Stack
- **Database**: MongoDB + Mongoose
- **Backend**: Express + Node.js (JavaScript)
- **Frontend**: React (Vite) + React Router + TailwindCSS
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
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   └── StatusBadge.jsx
│   │   │   ├── dashboard/
│   │   │   │   ├── CreateTeamModal.jsx
│   │   │   │   └── TeamCard.jsx
│   │   │   ├── task/
│   │   │   │   ├── TaskComments.jsx
│   │   │   │   └── TaskEditForm.jsx
│   │   │   ├── team/
│   │   │   │   ├── ActivityTimeline.jsx
│   │   │   │   ├── NewTaskModal.jsx
│   │   │   │   ├── TaskCard.jsx
│   │   │   │   ├── TaskFilterTabs.jsx
│   │   │   │   └── TeamMembersList.jsx
│   │   │   ├── Navbar.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── TaskDetail.jsx
│   │   │   └── TeamDetail.jsx
│   │   ├── utils/
│   │   │   └── date.js
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── .env
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── api.http
└── README.md
```

## Running the Application Locally

### 1. Prerequisites & MongoDB Requirement
- **Node.js**: v18 or higher.
- **MongoDB**: A running instance of MongoDB locally (default `mongodb://localhost:27017/team_task_tracker`) or a remote MongoDB URI.

### 2. Environment Variables Configuration

#### Backend (`server/.env`)
Copy `server/.env.example` to `server/.env`:
```bash
PORT=5000
MONGO_URI=mongodb://localhost:27017/team_task_tracker
ACCESS_TOKEN_SECRET=team_task_tracker_access_secret_key_15m
REFRESH_TOKEN_SECRET=team_task_tracker_refresh_secret_key_7d
```

#### Frontend (`client/.env`)
Copy `client/.env.example` to `client/.env`:
```bash
VITE_API_URL=http://localhost:5000/api
```

### 3. Start Backend Server
```bash
cd server
npm install
npm run dev # or npm start
```
The backend starts on `http://localhost:5000`.

### 4. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## Role Permissions & Authentication Details

### Role Permissions
- **Admin**:
  - Can create new teams via the "Create Team" button on `/dashboard`.
  - Can invite existing registered users to teams via email on `/teams/:id`.
  - Can create tasks, edit tasks, change task status, and post comments.
- **Member**:
  - Can view teams they belong to on `/dashboard` (cannot create teams).
  - Can view tasks and activity timeline for teams they belong to.
  - Can create tasks, edit tasks, change status, and post comments on teams they are members of.
  - Cannot invite members or create teams.
- **Non-Members**:
  - Return `403 Forbidden` if attempting to access tasks, details, or activities of a team they do not belong to.

### How Auth & Token Refresh Works
1. **Access & Refresh Tokens**:
   - Access tokens have a short lifespan (15 minutes).
   - Refresh tokens have a longer lifespan (7 days) and are stored securely in `localStorage`.
   - Access tokens are kept in-memory for security and sent via `Authorization: Bearer <token>` on API requests.
2. **Silent Automatic Token Refresh**:
   - When an API request receives a `401 Unauthorized`, `client/src/api.js` automatically intercepts the failure.
   - It issues a `POST /api/auth/refresh` with the stored `refreshToken`.
   - If successful, it updates the in-memory access token and transparently retries the original request.
   - If the refresh token is expired or invalid, it purges credentials and redirects to `/login`.

---

## Assumptions & Design Choices

1. **Role Selection at Registration**: For demo and evaluation purposes, the user selects their role (`admin` or `member`) directly on the registration form.
2. **Invitation Simulation**: Team invitations require that the invited email already belongs to a registered user in the database. When an admin invites a user, an email invitation is simulated via a server console log (`console.log("Invitation sent to ...")`), and the user is directly added to the team's `members` list.
3. **Live Activity Timeline**: The team activity timeline polls `GET /api/teams/:id/activity` every 5 seconds, ensuring real-time multi-session visibility without requiring complex WebSocket infrastructure. The polling interval is cleanly cancelled when navigating away.

---

## API Endpoints Summary

### Authentication (`/api/auth`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register a new user (`name`, `email`, `password`, `role`) | Public |
| `POST` | `/api/auth/login` | Authenticate user and receive tokens | Public |
| `POST` | `/api/auth/refresh` | Exchange `refreshToken` for a new `accessToken` | Public |
| `GET`  | `/api/auth/me` | Fetch authenticated user profile | Authenticated |

### Teams (`/api/teams`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `POST` | `/api/teams` | Create a new team | Admin only |
| `GET`  | `/api/teams` | List teams current user belongs to | Authenticated |
| `GET`  | `/api/teams/:id` | Get team details with populated members | Team Members |
| `POST` | `/api/teams/:id/invite` | Add registered user to team by email | Admin + Member |
| `POST` | `/api/teams/:id/tasks` | Create task in team | Team Members |
| `GET`  | `/api/teams/:id/tasks?status=` | List tasks with optional status filter | Team Members |
| `GET`  | `/api/teams/:id/activity` | Get team activity timeline (newest first) | Team Members |

### Tasks & Comments (`/api/tasks`)
| Method | Endpoint | Description | Access |
|---|---|---|---|
| `GET`   | `/api/tasks/:taskId` | Get task details | Team Members |
| `PATCH` | `/api/tasks/:taskId` | Update title, description, status, or assignee | Team Members |
| `GET`   | `/api/tasks/:taskId/comments` | List task comments (oldest first) | Team Members |
| `POST`  | `/api/tasks/:taskId/comments` | Post comment on a task | Team Members |

---

## Final Verification Checklist

The application supports complete end-to-end verification:
1. **Admin creates team & invites member**: Admin creates "Engineering" on `/dashboard` and invites `member@example.com` on `/teams/:id`.
2. **Member view restrictions**: Member logs in and sees "Engineering"; "Create Team" and "Invite New Member" are hidden.
3. **Timeline updates**: Creating a task, changing status to "In Progress", or adding a comment logs formatted activity events that appear in the timeline within 5 seconds across sessions.
4. **Status filter**: Clicking `All`, `Pending`, `In Progress`, or `Done` tabs dynamically filters tasks via `?status=`.
5. **Silent token refresh**: Expired access tokens trigger a background refresh to `/api/auth/refresh` without user interruption; an invalid refresh token redirects to `/login`.
