# Library Management System - Specification Document

## 1. Project Overview

### Project Name
Library Management System (LMS)

### Project Type
Full-stack Web Application (Django + React)

### Core Functionality
A comprehensive library management system that automates daily library operations including book borrowing/returning, inventory management, member registration, and fine calculation. The system provides an efficient, accurate, and user-friendly solution for both library staff and users (students, teachers, faculty).

### Target Users
- **Library Staff/Admin**: Manage books, members, and view reports
- **Students**: Search books, borrow books, view borrowing history
- **Teachers/Faculty**: Search books, borrow books, view borrowing history

---

## 2. Technology Stack

### Backend
- **Framework**: Django 5.x (Python 3.13)
- **Database**: SQLite (default, can be changed to PostgreSQL)
- **REST API**: Django REST Framework (DRF)
- **Authentication**: JWT (JSON Web Token)

### Frontend
- **Framework**: React 18.x
- **State Management**: React Context API
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **UI Components**: Custom CSS with modern design

---

## 3. Feature List

### Authentication & Authorization
- User registration and login
- Role-based access control (Admin, Member)
- JWT-based authentication

### Book Management (Admin)
- Add new books (title, author, ISBN, category, quantity)
- Edit book details
- Delete books
- View all books
- Search books by title, author, ISBN, category

### Member Management (Admin)
- Register new members (name, email, phone, membership type)
- Edit member details
- Delete members
- View all members
- View member borrowing history

### Borrowing System (Member)
- Borrow available books
- Return borrowed books
- View borrowing history
- Check book availability

### Fine Management (Admin)
- Automatic fine calculation for overdue returns
- Fine payment tracking
- View all fines
- Fine forgiveness option

### Search & Discovery
- Search books by title, author, ISBN, category
- Filter by availability
- View book details

### Dashboard
- Admin dashboard: Overview of total books, members, borrows, fines
- Member dashboard: Personal borrowing history, current borrows, fines

---

## 4. Data Models

### User (Extended Django User)
- id, username, email, password
- role (admin/member)
- phone, address, membership_date

### Book
- id, title, author, isbn, category
- description, publisher, publish_year
- quantity, available_quantity
- created_at, updated_at

### Member
- id, user (OneToOne with User)
- membership_type (student/teacher/faculty)
- membership_start_date, membership_end_date

### BorrowRecord
- id, member, book, borrow_date
- due_date, return_date
- status (borrowed/returned/overdue)

### Fine
- id, member, borrow_record, amount
- reason, paid_status, paid_date
- created_at

---

## 5. API Endpoints

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
- `GET /api/books/search/?q=` - Search books

### Members
- `GET /api/members/` - List all members (Admin)
- `POST /api/members/` - Create member (Admin)
- `GET /api/members/{id}/` - Get member details
- `PUT /api/members/{id}/` - Update member (Admin)
- `DELETE /api/members/{id}/` - Delete member (Admin)

### Borrowing
- `GET /api/borrows/` - List borrow records
- `POST /api/borrows/` - Borrow a book
- `GET /api/borrows/my/` - My borrow history (Member)
- `PUT /api/borrows/{id}/return/` - Return a book

### Fines
- `GET /api/fines/` - List all fines (Admin)
- `GET /api/fines/my/` - My fines (Member)
- `POST /api/fines/{id}/pay/` - Pay fine

### Dashboard
- `GET /api/dashboard/stats/` - Get dashboard statistics

---

## 6. UI/UX Design

### Color Scheme
- Primary: #2563eb (Blue)
- Secondary: #1e293b (Dark Slate)
- Accent: #f59e0b (Amber)
- Background: #f8fafc (Light Gray)
- Text: #1e293b (Dark)
- Success: #10b981 (Green)
- Error: #ef4444 (Red)
- Warning: #f59e0b (Amber)

### Typography
- Headings: 'Inter', sans-serif
- Body: 'Inter', sans-serif
- Font sizes: 
  - H1: 2.5rem
  - H2: 2rem
  - H3: 1.5rem
  - Body: 1rem
  - Small: 0.875rem

### Layout
- Responsive design (mobile, tablet, desktop)
- Sidebar navigation for admin
- Top navbar for main navigation
- Card-based layout for books and data
- Clean, modern interface with proper spacing

### Components
- Navigation bar
- Sidebar (Admin)
- Book cards
- Member cards
- Data tables
- Forms (login, registration, book/member forms)
- Modal dialogs
- Toast notifications
- Loading spinners

---

## 7. Project Structure

```
library-management-system/
├── backend/                 # Django backend
│   ├── library/            # Main Django app
│   │   ├── models.py       # Database models
│   │   ├── views.py        # API views
│   │   ├── serializers.py # DRF serializers
│   │   ├── urls.py         # URL routing
│   │   └── admin.py        # Admin configuration
│   ├── users/              # Users app
│   │   ├── models.py
│   │   ├── views.py
│   │   ├── serializers.py
│   │   └── urls.py
│   ├── manage.py
│   ├── requirements.txt
│   └── library_project/    # Django project settings
│       ├── settings.py
│       ├── urls.py
│       └── wsgi.py
├── frontend/               # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── vite.config.js (or webpack.config.js)
└── README.md
```

---

## 8. Acceptance Criteria

### Authentication
- [ ] User can register with username, email, password
- [ ] User can login with email and password
- [ ] JWT token is stored and used for authentication
- [ ] User role (admin/member) is properly assigned

### Book Management
- [ ] Admin can add new books with all required fields
- [ ] Admin can edit existing book details
- [ ] Admin can delete books
- [ ] Users can view all books
- [ ] Search functionality works correctly

### Member Management
- [ ] Admin can register new members
- [ ] Admin can edit member details
- [ ] Admin can delete members
- [ ] Member can view their own profile

### Borrowing System
- [ ] Member can borrow available books
- [ ] Member can return borrowed books
- [ ] Due date is automatically calculated
- [ ] Borrow history is tracked

### Fine Management
- [ ] Fine is automatically calculated for overdue returns
- [ ] Member can view their fines
- [ ] Admin can view all fines
- [ ] Fine payment is processed

### Dashboard
- [ ] Admin sees overview statistics
- [ ] Member sees personal statistics

### UI/UX
- [ ] Application is responsive
- [ ] Navigation is intuitive
- [ ] Forms have proper validation
- [ ] Error messages are displayed clearly

---

## 9. Implementation Notes

- Use Django's built-in authentication system
- Implement proper validation for all forms
- Handle edge cases (e.g., borrowing more books than available)
- Use proper HTTP status codes for API responses
- Implement CORS for frontend-backend communication
- Use environment variables for sensitive configuration
