import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link
          to={user?.role === 'member' ? '/dashboard/member' : '/dashboard/staff'}
          style={{ color: 'white', textDecoration: 'none' }}
        >
          Library Management System
        </Link>
      </div>
      {user?.role === 'member' && (
        <div className="navbar-menu">
          <Link to="/dashboard/member" style={{ color: 'white', textDecoration: 'none' }}>Dashboard</Link>
          <Link to="/books" style={{ color: 'white', textDecoration: 'none' }}>Books</Link>
          <Link to="/borrow-book" style={{ color: 'white', textDecoration: 'none' }}>Borrow</Link>
          <Link to="/borrow-history" style={{ color: 'white', textDecoration: 'none' }}>History</Link>
          <Link to="/fines" style={{ color: 'white', textDecoration: 'none' }}>Fines</Link>
        </div>
      )}
      <div className="navbar-user">
        <span>Welcome, {user?.username} ({user?.role})</span>
        <button onClick={handleLogout}>Logout</button>
      </div>
    </nav>
  )
}

export default Navbar
