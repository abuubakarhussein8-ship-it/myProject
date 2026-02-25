# LIBRARY MANAGEMENT SYSTEM

Full-stack Library Management System with:
- Backend: Django + DRF + PostgreSQL + JWT
- Frontend: React (Vite) + Axios + React Router

## Backend Features
- Custom user model with roles: `admin`, `librarian`, `member`
- Member profile model (phone, address, membership dates)
- Book inventory management
- Borrow/return flow with stock automation
- Overdue fine calculation and fines management
- JWT auth (`login`, `refresh`)
- Role-based permissions
- Viewsets, serializers, pagination, search

## Frontend Features
- Login/Register
- Role-based dashboards:
  - `member` -> member dashboard
  - `admin/librarian` -> staff dashboard
- Books Management
- Members Management
- Borrow Book
- Borrow History
- Fines View
- Protected routes + JWT refresh interceptor
- Search + pagination

## Project Structure
```text
backend/
  library/
  users/
  library_project/
frontend/
  src/
    components/
    context/
    pages/
    services/
```

## Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

Create `.env` from `backend/.env.example`, then run:
```bash
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser
python manage.py runserver
```

Backend URL: `http://127.0.0.1:8000`

## Frontend Setup
```bash
cd frontend
npm install
```

Create `.env` from `frontend/.env.example`, then run:
```bash
npm run dev
```

Frontend URL: `http://127.0.0.1:5173`

## Core API Endpoints

### Auth
- `POST /api/auth/register/`
- `POST /api/auth/login/`
- `GET /api/auth/me/`
- `POST /api/token/refresh/`

### Members
- `GET /api/auth/users/`
- `POST /api/auth/users/`
- `PATCH /api/auth/users/{id}/`
- `DELETE /api/auth/users/{id}/`

### Books
- `GET /api/books/?search=<text>&page=1`
- `POST /api/books/`
- `PATCH /api/books/{id}/`
- `DELETE /api/books/{id}/`

### Borrows
- `GET /api/borrows/`
- `GET /api/borrows/history/`
- `POST /api/borrows/`
- `POST /api/borrows/{id}/return_book/`

### Fines
- `GET /api/fines/`
- `POST /api/fines/{id}/pay/`

### Dashboard
- `GET /api/dashboard-stats/`

## Deploy (Render + Vercel)

### 1) Backend on Render
- Push this repo to GitHub.
- In Render, create a new **Blueprint** and select your repo root (use [`render.yaml`](/c:/Users/Jewish/Desktop/New folder/render.yaml)).
- Set these backend env vars in Render:
  - `DJANGO_SECRET_KEY`
  - `POSTGRES_HOST` (optional now, required for PostgreSQL)
  - `POSTGRES_DB`
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`
  - `POSTGRES_PORT` (default `5432`)
  - `CORS_ALLOWED_ORIGINS` (set to your Vercel URL, e.g. `https://your-app.vercel.app`)
  - `CSRF_TRUSTED_ORIGINS` (same Vercel URL)
- Render build runs [`backend/build.sh`](/c:/Users/Jewish/Desktop/New folder/myProject/backend/build.sh), which now does:
  - `migrate`
  - `collectstatic`

### 2) Frontend on Vercel
- In Vercel, import the same repo and set **Root Directory** to `myProject/frontend`.
- Vercel uses [`frontend/vercel.json`](/c:/Users/Jewish/Desktop/New folder/myProject/frontend/vercel.json) for SPA rewrites.
- Add frontend env var:
  - `VITE_API_BASE_URL=https://<your-render-service>.onrender.com/api/`
- Deploy.
