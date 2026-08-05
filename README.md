
Phoenix — Frontend

SvelteKit frontend for Phoenix, a personal journaling and life-tracking web application.

Live: phoenix-frontend-ashy.vercel.app

Tech Stack

SvelteKit with TypeScript
Deployed on Vercel
Connects to Phoenix backend API (FastAPI + MongoDB)

Features

User authentication (login/registration)
Ritual/journal entry submission
Tag creation and suggestion system
Emotional weight metadata per tag
Environment-based API configuration via PUBLIC_API_URL

Related Repo
Backend: github.com/vikingcoder/phoenix-os

Getting Started

npm install
npm run dev

Set PUBLIC_API_URL in .env for local development:

PUBLIC_API_URL=http://127.0.0.1:8000
