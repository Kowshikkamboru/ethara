Team Task Manager - Full-Stack Web Application

1. Project Overview
This is a full-stack Team Task Manager built to streamline project creation, task delegation, and progress tracking. It features role-based access control, allowing Admins to manage projects and assign tasks, while Members can update task statuses and view their dashboards.

2. Live Application & Repository
Live URL: [Insert your Railway URL here]
GitHub Repo: [Insert your GitHub Repo Link here]

3. Tech Stack
- Frontend: Next.js (React), Tailwind CSS
- Backend: Next.js Route Handlers (REST API)
- Database: PostgreSQL
- ORM: Prisma
- Authentication: NextAuth.js (Role-Based Access Control)
- Deployment: Railway

4. Core Features
- User Authentication: Secure login/signup with hashed passwords.
- Role-Based Access:
   - ADMIN: Can create projects, add members, and assign tasks.
   - MEMBER: Can view assigned tasks and update statuses (TODO, IN_PROGRESS, DONE).
- Dashboard: High-level overview of pending, completed, and overdue tasks.
- Project & Task Management: Full CRUD operations for projects and tasks with relational data mapping.

5. Local Setup Instructions
Prerequisites: Node.js, npm/yarn, and a PostgreSQL instance.

Step 1: Clone the repository
git clone [Your Repo Link]
cd team-task-manager

Step 2: Install dependencies
npm install

Step 3: Environment Variables
Create a .env file in the root directory:
DATABASE_URL="postgresql://user:password@localhost:5432/taskdb"
NEXTAUTH_SECRET="your_super_secret_string"
NEXTAUTH_URL="http://localhost:3000"

Step 4: Database Setup
npx prisma generate
npx prisma db push

Step 5: Run the development server
npm run dev

6. API Endpoints (Brief Overview)
- POST /api/auth/register : Create a new user.
- GET /api/projects : Fetch all projects for the logged-in user.
- POST /api/projects : Create a new project (Admin only).
- GET /api/tasks : Fetch tasks based on user role and project.
- PATCH /api/tasks/:id : Update task status or assignment.
