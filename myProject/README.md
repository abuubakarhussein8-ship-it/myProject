# Library Management System

A comprehensive library management system built with Django (backend) and React (frontend). This system automates daily library operations including book borrowing, inventory management, member registration, and fine calculation.

## Features

- **Authentication & Authorization**: User registration, login, role-based access control (Admin/Member)
- **Book Management**: Add, edit, delete, search books
- **Member Management**: Register, edit, delete library members
- **Borrowing System**: Borrow books, return books, track borrowing history
- **Fine Management**: Automatic fine calculation for overdue returns
- **Dashboard**: Overview statistics for admins and members

## Technology Stack

### Backend
- Django 5.x
- Django REST Framework
- PostgreSQL (database)
- JWT Authentication

### Frontend
- React 18.x
- React Router v6
- Axios
- Vite

## Project Structure

```
library-management-system/
├── backend/                 # Django backend
│   ├── library/            # Library app (books, borrows, fines)
│   ├── users/              # Users app (authentication, members)
│   ├── library_project/    # Django project settings
│   ├── manage.py
│   └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── context/       # React context (Auth)
│   │   ├── services/     # API services
│   │   └── App.jsx        # Main app component
│   ├── package.json
│   └── vite.config.js
├── SPEC.md                # Project specification
├── TODO.md               # Implementation tasks
└── README.md             # This file
```

## Setup Instructions

### Prerequisites
- Python 3.13+
- Node.js 18+
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   
```
bash
cd backend
```

2. Create a virtual environment (optional but recommended):
   
```
bash
python -m venv venv
venv\Scripts\activate  # On Windows
```

3. Install Python dependencies:
   
```
bash
pip install -r requirements.txt
```

4. Ensure PostgreSQL is running and create the database:

```
sql
CREATE DATABASE library_db;
```

5. Update database credentials in `library_project/settings.py` if needed:
   - NAME: 'library_db'
   - USER: 'your_postgres_username'
   - PASSWORD: 'your_postgres_password'

6. Run migrations:
   
```
bash
python manage.py migrate
```

7. Create a superuser (optional):
   
```
bash
python manage.py createsuperuser
```

8. Start the Django development server:
   
```
bash
python manage.py runserver
```

The backend will be available at `http://localhost:8000`

### Database Configuration (PostgreSQL)

The project is configured to use PostgreSQL by default. The database settings in `library_project/settings.py` are:

```
python
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': 'library_db',
        'USER': 'abuu',
        'PASSWORD': 'Abu2026',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}
```

Make sure PostgreSQL is installed and running, and update the credentials as needed.

### Frontend Setup

1. Navigate to the frontend directory:
   
```
bash
   cd frontend
   
```

2. Install dependencies:
   
```
bash
   npm install
   
```

3. Start the development server:
   
```
bash
   npm run dev
   
```

The frontend will be available at `http://localhost:5173`

### Building for Production

1. Build the frontend:
   
```
bash
   cd frontend
   npm run build
   
```

The production build will be in the `frontend/dist` folder.

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login user
- `POST /api/auth/logout/` - Logout user
- `GET /api/auth/user/` - Get current user

### Books
- `GET /api/books/` - List all books
- `POST /api/books/` - Create book (Admin)
- `GET /api/books/{id}/` - Get book details
- `PUT /api/books/{id}/` - Update book (Admin)
- `DELETE /api/books/{id}/` - Delete book (Admin)

### Members
- `GET /api/users/users/` - List all members (Admin)
- `POST /api/users/users/` - Create member (Admin)
- `GET /api/users/users/{id}/` - Get member details
- `PUT /api/users/users/{id}/` - Update member (Admin)
- `DELETE /api/users/users/{id}/` - Delete member (Admin)

### Borrowing
- `GET /api/borrows/` - List borrow records
- `POST /api/borrows/` - Borrow a book
- `PUT /api/borrows/{id}/return/` - Return a book

### Fines
- `GET /api/fines/` - List all fines
- `POST /api/fines/{id}/pay/` - Pay fine

### Dashboard
- `GET /api/dashboard/stats/` - Get dashboard statistics

## Usage

1. Start both the backend and frontend servers
2. Open the frontend in your browser
3. Register a new account or login
4. If you're an admin, you can manage books, members, and view all records
5. If you're a member, you can search books, borrow books, and view your history

## License

MIT License
