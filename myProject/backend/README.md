# Library Management System API

This is a Backend API for a Library Management System developed using Django and Django REST Framework.

## Features
- **User Authentication:** Register, Login (Admin & Members).
- **Book Management:** Add, Update, Delete, and List books.
- **Borrowing System:** Borrow books, Return books, Track due dates.
- **Fine System:** Automatic fine calculation for overdue books.
- **Dashboard:** Statistics for Admins and Members.

## Technologies Used
- Python (Django)
- Django REST Framework
- SQLite (Local) / PostgreSQL (Production)
- Render (Cloud Deployment)

## How to Run Locally
1. Clone the repository.
2. Create a virtual environment: `python -m venv venv`
3. Activate environment: `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. Run migrations: `python manage.py migrate`
6. Start server: `python manage.py runserver`

## Deployment
[Insert your Render Live URL here after deployment]