# Skill Gap Analyzer

Skill Gap Analyzer is a full-stack career readiness platform that helps users choose a career path, mark the skills they already know, and see how far they are from role readiness.

The app includes authentication, a career-path catalog, roadmap tracking, skill-based evaluation, and a dashboard that stores recent assessment history in the browser.

## Features

- User registration and login with JWT authentication
- Career path browsing across Software/IT, Core Engineering, and Government Exams
- Skill input with `basic`, `intermediate`, and `advanced` proficiency levels
- Roadmap view with dependency-aware learning order
- Readiness scoring based on weighted skills and proficiency multipliers
- Recommendations, missing-skill analysis, and estimated completion time
- Dashboard charts for category performance and assessment trends
- Seed script with curated sample data for multiple domains

## Tech Stack

- Frontend: React 18, TypeScript, Vite, Tailwind CSS, Recharts, Axios
- Backend: Node.js, Express, MongoDB, Mongoose, JWT, Express Validator

## Project Structure

```text
skill-gap-analyzer/
|-- backend/    # Express API, MongoDB models, evaluation engine, seed script
|-- frontend/   # React + Vite client application
|-- package.json
`-- README.md
```

## Getting Started

### 1. Install dependencies

From the project root:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2. Create environment variables

Create a `.env` file in the project root:

```env
MONGO_URI=mongodb://127.0.0.1:27017/skill-gap-analyzer
JWT_SECRET=your_jwt_secret_here
PORT=5000
```

Notes:

- `backend/src/config/db.js` supports either `MONGO_URI` or `MONGO_DIRECT_URI`
- If you use MongoDB Atlas and SRV DNS causes issues, you can also set `MONGO_DIRECT_URI`

Example:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/skill-gap-analyzer
MONGO_DIRECT_URI=mongodb://username:password@host1,host2,host3/skill-gap-analyzer?replicaSet=atlas-xxxxx-shard-0&ssl=true&authSource=admin
JWT_SECRET=replace_this_with_a_secure_secret
PORT=5000
```

### 3. Seed the database

After MongoDB is available, run:

```bash
cd backend
npm run seed
```

This clears existing `skills` and `career paths`, then inserts curated sample data including:

- Full Stack Developer
- AI/ML Engineer
- Cybersecurity Specialist
- Android Developer
- Data Scientist
- Mechanical, Electrical, and Civil engineering tracks
- UPSC, SSC/Banking, and GATE preparation tracks

### 4. Start the backend

```bash
cd backend
npm run dev
```

The API runs on `http://localhost:5000`.

### 5. Start the frontend

In a separate terminal:

```bash
cd frontend
npm run dev
```

The frontend runs on `http://localhost:5173`.

Vite is already configured to proxy `/api` requests to `http://localhost:5000`.

## Available Scripts

### Root

```bash
npm test
```

The root package currently has only the default placeholder test script.

### Backend

```bash
npm start
npm run dev
npm run seed
```

### Frontend

```bash
npm run dev
npm run build
npm run preview
npm run lint
```

## API Overview

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `PUT /api/auth/profile`

### Career paths

- `GET /api/career-paths`
- `GET /api/career-paths/:id`

### Skills

- `GET /api/skills`
- `GET /api/skills/:id`

### Evaluation

- `POST /api/evaluate`
- `POST /api/evaluate/compare`

### Health check

- `GET /api/health`

## How Evaluation Works

- Each skill has a weight and importance level
- Selected proficiencies are scored with multipliers:
  - `basic = 0.5`
  - `intermediate = 0.8`
  - `advanced = 1.0`
- Missing prerequisites can reduce the earned score
- The engine returns:
  - overall readiness score
  - readiness level
  - category breakdown
  - missing skills
  - warnings
  - estimated weeks to improve

## Current User Flow

1. Register or log in
2. Open the home dashboard
3. Browse or search career paths
4. Select a path and mark known skills
5. Run readiness analysis
6. Review dashboard insights and roadmap progress

## Notes

- The frontend stores JWT auth state and recent dashboard history in `localStorage`
- The backend protects evaluation routes with authentication middleware
- The project currently does not include automated tests
