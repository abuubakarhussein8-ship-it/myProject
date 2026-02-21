# TODO - Dashboard Updates

## Task: Add data tables to Dashboard with totals display

### Step 1: Fix API Endpoint
- [x] Fix frontend API to call correct endpoint `dashboard-stats/` instead of `dashboard/stats/`

### Step 2: Add active_borrows to Backend
- [x] Update backend/library/views.py to include `active_borrows` in response

### Step 3: Update Dashboard with Tables
- [x] Update frontend/src/pages/Dashboard.jsx to show:
  - Cards with totals (already exists, but fix data)
  - Tables showing actual data for:
    - Books (title, author, category, available)
    - Members (username, email, member_type, membership_date)
    - Fines (member, amount, reason, status)
    - Active Borrows (member, book, due_date, status)

## Files Edited:
1. frontend/src/services/api.js - Fixed dashboard API endpoint
2. backend/library/views.py - Added active_borrows field
3. frontend/src/pages/Dashboard.jsx - Added data tables
4. frontend/src/index.css - Added data-table and status-badge styles

## Status: COMPLETED ✓
