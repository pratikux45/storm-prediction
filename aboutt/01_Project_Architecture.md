# 1. Project Architecture (Full Stack Overview)

## What is this project?
This project is the "India Storm Prediction Dashboard." It is a full-stack web application designed to show historical weather data and predict the risk of storms for various cities in India.

## How is it built? (The Tech Stack)
The project is divided into two main parts that talk to each other over the network via HTTP requests (APIs).

### 1. The Frontend (Client-Side)
- **Framework:** React.js (using Vite for fast building and compiling).
- **Language:** TypeScript (adds strong typing to JavaScript to prevent bugs).
- **Styling:** Tailwind CSS (utility-first CSS framework for rapid UI development).
- **Animations:** Framer Motion (for the smooth animations like the search bar expanding and UI elements fading in).
- **Charts/Maps:** Recharts (for the data radar chart) and React-Simple-Maps (for the interactive map of India).

### 2. The Backend (Server-Side)
- **Framework:** FastAPI (a modern, fast Python web framework).
- **Language:** Python.
- **Database:** SQLite (a lightweight, file-based database).
- **ORM:** SQLAlchemy (Object-Relational Mapper - lets us interact with the database using Python objects instead of raw SQL queries).

## How do they communicate?
When a user searches for a city on the Frontend, React makes an HTTP `GET` request (using the `fetch` API) to the Backend FastAPI server (e.g., `http://127.0.0.1:8000/api/forecast/Mumbai`). 
The Backend queries the SQLite database, runs its risk assessment logic, and sends the data back as JSON. The Frontend receives this JSON and updates the UI state to show the new weather data and charts.
