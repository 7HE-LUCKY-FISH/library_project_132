# Library Management System

A full-stack library management system with a React frontend, a FastAPI backend, and a MySQL database.

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios

### Backend
- FastAPI
- SQLAlchemy
- Pydantic
- Python-Dotenv
- Uvicorn

### Database
- MySQL

## Project Structure

```text
project-root/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   └── routes/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── services/
│   ├── main.py
│   ├── scripts.py
│   ├── create_admin.py
│   ├── requirements.txt
│   └── .env
└── README.md