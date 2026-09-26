# 🚀 TaskFlow

> **AI-powered project & task management for teams that want to turn goals into action.**

TaskFlow is a modern full-stack project management platform built with **Next.js, React, Tailwind CSS, Node.js, Express, MongoDB and JWT authentication**. It combines a clean productivity dashboard, project workspaces, a drag-and-drop Kanban board, REST APIs, and an AI-assisted task generator in one application.

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-14-black?logo=next.js" alt="Next.js 14" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?logo=react" alt="React 18" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-3-38B2AC?logo=tailwindcss" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/Node.js-18%2B-339933?logo=node.js" alt="Node.js 18+" />
  <img src="https://img.shields.io/badge/Express-4-000000?logo=express" alt="Express" />
  <img src="https://img.shields.io/badge/MongoDB-8-47A248?logo=mongodb" alt="MongoDB" />
  <img src="https://img.shields.io/badge/JWT-Auth-purple?logo=jsonwebtokens" alt="JWT Authentication" />
  <img src="https://img.shields.io/badge/OpenAI-AI-412991?logo=openai" alt="OpenAI" />
</p>

---

## ✨ Why TaskFlow?

TaskFlow is designed around a simple workflow:

**Create a project → define a goal → generate or add tasks → organize them on a Kanban board → track progress from the dashboard.**

Instead of treating AI as a separate chatbot, TaskFlow puts AI directly inside the project workflow so generated tasks can be saved and managed alongside manually created work.

### 🌟 Highlights

| Capability | What it does |
|---|---|
| 🔐 **Secure Authentication** | JWT-based login/register with bcrypt password hashing |
| 📊 **Analytics Dashboard** | Projects, total tasks, in-progress tasks, completion rate & recent activity |
| 📁 **Project Management** | Create, view, search, filter and delete projects |
| ✅ **Task Management** | Create, update and delete tasks with priorities and due dates |
| 🧩 **Kanban Workflow** | Move tasks between To Do, In Progress and Done using drag & drop |
| 🔎 **Search & Filters** | Quickly find tasks and filter them by status |
| 🤖 **AI Task Generation** | Turn a natural-language project goal into actionable tasks |
| 🛡️ **AI Fallback** | Built-in heuristic generation keeps the feature usable without an OpenAI key |
| 🌐 **REST API** | Structured backend endpoints for authentication, projects, tasks, AI and statistics |
| 📦 **Postman Ready** | Includes a ready-to-import API collection |

---

## 🧠 AI-Powered Task Generation

Give TaskFlow a goal such as:

> **“Launch a beta signup page with email capture.”**

TaskFlow can generate a set of actionable tasks containing:

- Task title
- Description
- Priority
- Project association

### Two-layer AI design

```text
                    Project Goal
                         │
                         ▼
                ┌─────────────────┐
                │ TaskFlow AI API │
                └────────┬────────┘
                         │
               ┌─────────┴─────────┐
               ▼                   ▼
        OpenAI configured?      No / failed
               │                   │
               ▼                   ▼
        OpenAI generation     Heuristic engine
               │                   │
               └─────────┬─────────┘
                         ▼
                 Generated Tasks
                         │
                         ▼
                  MongoDB + Kanban
```

If `OPENAI_API_KEY` is unavailable or the OpenAI request fails, TaskFlow automatically falls back to its deterministic heuristic engine instead of breaking the user workflow.

---

## 🖥️ Application Flow

```text
┌──────────────┐
│  Register /  │
│    Login     │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│  Dashboard   │
│  Analytics   │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│   Projects   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────────┐
│       Project Workspace     │
│                              │
│  🤖 AI Task Generation       │
│  ➕ Manual Task Creation     │
│  🔎 Search & Filters         │
│  📌 Kanban Board             │
└──────────────┬───────────────┘
               │
               ▼
        ┌──────────────┐
        │   MongoDB    │
        └──────────────┘
```

---

## 🛠️ Tech Stack

### Frontend
- **Next.js 14** — App Router
- **React 18**
- **Tailwind CSS**
- Client-side authentication state
- Responsive UI components
- Drag-and-drop Kanban interactions

### Backend
- **Node.js**
- **Express.js**
- **Mongoose**
- **JWT**
- **bcryptjs**
- **express-validator**
- **Morgan**
- Centralized error handling

### AI & Data
- **OpenAI API**
- Deterministic heuristic fallback
- **MongoDB**

### Developer Tools
- npm
- Postman
- Environment-based configuration
- Nodemon for backend development

---

## 🏗️ Project Architecture

```text
taskflow/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js
│   │   ├── middleware/
│   │   │   ├── auth.js
│   │   │   ├── errorHandler.js
│   │   │   └── validate.js
│   │   ├── models/
│   │   │   ├── User.js
│   │   │   ├── Project.js
│   │   │   └── Task.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── projects.js
│   │   │   ├── tasks.js
│   │   │   ├── ai.js
│   │   │   └── stats.js
│   │   ├── utils/
│   │   │   ├── aiService.js
│   │   │   └── generateToken.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── app/
│   │   ├── login/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── projects/
│   │   ├── globals.css
│   │   └── layout.js
│   ├── components/
│   │   ├── Navbar.js
│   │   ├── ProjectCard.js
│   │   ├── ProtectedRoute.js
│   │   ├── StatCard.js
│   │   ├── TaskBoard.js
│   │   └── TaskCard.js
│   ├── context/
│   │   └── AuthContext.js
│   ├── lib/
│   │   └── api.js
│   ├── .env.local.example
│   └── package.json
│
├── postman_collection.json
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have:

- **Node.js 18+**
- **npm**
- **MongoDB** — local MongoDB or MongoDB Atlas
- Optional: **OpenAI API key** for real AI generation
- Optional: **Postman** for API testing

### 1. Clone the repository

```bash
git clone https://github.com/Mohitrath/taskflow.git
cd taskflow
```

### 2. Start the backend

```bash
cd backend
npm install
```

Create your environment file:

```bash
cp .env.example .env
```

For Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

Then configure the values in `.env`.

Start the development server:

```bash
npm run dev
```

Backend:

```
http://localhost:5000
```

### 3. Start the frontend

Open a second terminal:

```bash
cd frontend
npm install
```

Create the frontend environment file:

```bash
cp .env.local.example .env.local
```

For Windows PowerShell:

```powershell
Copy-Item .env.local.example .env.local
```

Start Next.js:

```bash
npm run dev
```

Frontend:

```
http://localhost:3000
```

---

## 🔐 Environment Variables

### Backend — `backend/.env`

| Variable | Required | Purpose |
|---|:---:|---|
| `PORT` | No | Backend port. Defaults to `5000` |
| `MONGO_URI` | **Yes** | MongoDB connection string |
| `JWT_SECRET` | **Yes** | Secret used to sign JWT tokens |
| `JWT_EXPIRES_IN` | No | JWT lifetime. Defaults to `7d` |
| `CLIENT_ORIGIN` | Production | Allowed frontend origin(s) for CORS |
| `OPENAI_API_KEY` | No | Enables OpenAI-powered task generation |
| `OPENAI_MODEL` | No | OpenAI model. Defaults to `gpt-4o-mini` |

### Frontend — `frontend/.env.local`

| Variable | Required | Purpose |
|---|:---:|---|
| `NEXT_PUBLIC_API_URL` | **Yes** | Backend API base URL, e.g. `http://localhost:5000/api` |

> 🔒 **Never commit real API keys, database credentials or JWT secrets.** The repository contains example environment files only.

---

## 🔌 REST API

All API endpoints are prefixed with:

```
/api
```

Protected endpoints use:

```http
Authorization: Bearer <JWT_TOKEN>
```

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Login and receive JWT |
| GET | `/auth/me` | Get current authenticated user |

### Projects

| Method | Endpoint | Description |
|---|---|---|
| GET | `/projects` | List projects |
| GET | `/projects/:id` | Get project details |
| POST | `/projects` | Create a project |
| PUT | `/projects/:id` | Update a project |
| DELETE | `/projects/:id` | Delete a project and its tasks |

### Tasks

| Method | Endpoint | Description |
|---|---|---|
| GET | `/tasks` | List tasks |
| POST | `/tasks` | Create a task |
| PUT | `/tasks/:id` | Update task details/status |
| DELETE | `/tasks/:id` | Delete a task |

Supported task filters include project, status, priority and search.

### AI & Dashboard

| Method | Endpoint | Description |
|---|---|---|
| POST | `/ai/projects/:projectId/generate-tasks` | Generate tasks from a natural-language goal |
| GET | `/stats/dashboard` | Get aggregated dashboard statistics |

### 📮 Postman

A ready-to-import collection is included:

```
postman_collection.json
```

---

## 🧪 Useful Commands

### Backend

```bash
npm run dev      # Development with Nodemon
npm start        # Production-style Node start
```

### Frontend

```bash
npm run dev      # Start Next.js development server
npm run build    # Create production build
npm start        # Start production server
npm run lint     # Run Next.js linting
```

---

## 🛡️ Security & Reliability

TaskFlow includes several safeguards at the application layer:

- 🔐 Passwords are hashed using **bcrypt**
- 🎟️ Authentication uses signed **JWT tokens**
- 🚧 Protected frontend routes require authentication
- 🧾 Backend inputs are validated with **express-validator**
- 🧯 Centralized backend error handling
- 🌐 CORS configuration through environment variables
- 🔑 Sensitive credentials are kept outside source control
- 🤖 AI failures gracefully fall back to local task generation
- 🗑️ Deleting a project cascades its associated tasks

---

## 📈 Dashboard Metrics

The dashboard aggregates useful project-level information from the backend:

- **Project count**
- **Total task count**
- **Tasks currently in progress**
- **Overall completion rate**
- **Recent task activity**

This gives users a quick overview without opening every project individually.

---

## 🎯 Task Workflow

Each task can move through three stages:

```text
┌──────────┐      ┌──────────────┐      ┌──────────┐
│  To Do   │ ───► │ In Progress  │ ───► │   Done   │
└──────────┘      └──────────────┘      └──────────┘
      ▲                  │                    │
      └──────────────────┴────────────────────┘
             Drag & Drop / Status Update
```

Tasks also support:

- Low / Medium / High / Urgent priority
- Due dates
- Search
- Status filtering
- Manual creation
- AI-assisted creation

---

## ☁️ Deployment

A typical production setup can be split into three services:

```text
┌─────────────────┐
│     Vercel      │
│    Next.js UI   │
└────────┬────────┘
         │ HTTPS / REST API
         ▼
┌─────────────────┐
│ Render / Railway│
│ Express Backend │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  MongoDB Atlas  │
│    Database     │
└─────────────────┘
```

### Frontend

Deploy the `frontend/` directory to your preferred Next.js hosting platform.

Set:

```
NEXT_PUBLIC_API_URL=<your-backend-api>/api
```

### Backend

Deploy the `backend/` directory to your Node.js hosting platform.

Set:

```
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=<strong-random-secret>
CLIENT_ORIGIN=<your-frontend-url>
OPENAI_API_KEY=<optional>
OPENAI_MODEL=<optional>
```

After deployment, make sure the backend CORS configuration allows the deployed frontend origin.

---

## 🗺️ Roadmap

Potential future improvements:

- [ ] Team workspaces and member invitations
- [ ] Role-based access control
- [ ] Task comments and activity history
- [ ] Notifications and reminders
- [ ] Calendar integration
- [ ] File attachments
- [ ] Richer project analytics
- [ ] AI task prioritization and deadline suggestions
- [ ] Automated tests and CI/CD
- [ ] Dark mode

---

## 🤝 Contributing

Contributions are welcome.

```bash
# 1. Fork the repository
# 2. Create a feature branch
git checkout -b feature/my-feature

# 3. Make your changes and commit
git add .
git commit -m "feat: add my feature"

# 4. Push the branch
git push origin feature/my-feature

# 5. Open a Pull Request
```

Please keep secrets out of commits and follow the existing project structure.

---

## 📄 License

This project is currently provided without an explicit open-source license. Add a `LICENSE` file if you plan to distribute the project under a specific license.

---

## 👨‍💻 Author

**Mohitrath**

Built with ❤️ using **Next.js + Express + MongoDB + AI**.

<p align="center">
  <strong>Turn goals into tasks. Turn tasks into progress. 🚀</strong>
</p>
