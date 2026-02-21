# Library Management System - Implementation Plan

## Backend Fixes Needed:
1. [ ] Fix LoginView to return JWT tokens instead of session auth
2. [ ] Add user update endpoint (PUT /users/<id>/)
3. [ ] Add borrow request approval/rejection endpoints for admin
4. [ ] Add analytics endpoints for overdue tracking

## Frontend Fixes Needed:
1. [ ] Fix App.jsx - rewrite with proper routing
2. [ ] Fix AuthContext.jsx - use username, handle JWT tokens properly
3. [ ] Fix API service - correct endpoint paths
4. [ ] Fix Login page - use username instead of email
5. [ ] Fix Register page - ensure proper registration
6. [ ] Implement all dashboard pages properly
7. [ ] Add proper CSS styling

## Integration:
1. [ ] Test JWT authentication flow
2. [ ] Connect frontend to backend APIs
3. [ ] Test role-based access control
