# Library Management System

A full-stack library management system with a React frontend, a FastAPI backend, and a MySQL database.

For backend detail look at [backend guide](backend/Guide.md)

## Start Up

### Database 
Make sure MySQL8 is installed
Start the MySQL server

### Backend
```
 cd backend
 python scripts.py # Populates the database
 python main.py # Starts API
```

Create a .env file mathcing the .env.example


### Frontend
Make sure Node.js 20.0+ is installed
```
cd frontend
npm i
npm run dev
```

Default admin account is: 

```
user: admin

password: adminpassword
```

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
