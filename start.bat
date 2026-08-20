@echo off
echo Starting Backend (FastAPI)...
start cmd /k "cd backend && python -m uvicorn app.main:app --reload"

echo Starting Frontend (React/Vite)...
start cmd /k "cd frontend && npm run dev"

echo Both servers are starting! You can close this window.
