import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import AdminDashboard from './pages/AdminDashboard'
import Books from './pages/Books'
import Members from './pages/Members'
import Borrows from './pages/Borrows'
import Fines from './pages/Fines'
import Navbar from './components/Navbar'
import Sidebar from './components/Sidebar'
import './App.css'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/login" />
}

function AdminRoute({ children }) {
  const { user } = useAuth()
  return user && user.role === 'admin' ? children : <Navigate to="/dashboard" />
}

function App() {
  const { user } = useAuth()

  return (
    <div className="app">
      {user && <Navbar />}
      <div className="app-container">
        {user && user.role === 'admin' && <Sidebar />}
        <div className="main-content">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/dashboard" 
              element={
                user?.role === "admin"? (
                  <Navigate to="/admin" />
                ) : (
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                )
              }
            />
            <Route 
              path="/admin" 
              element={
                <AdminRoute>
                  <AdminDashboard />
                </AdminRoute>
              }
            />
            <Route 
              path="/books" 
              element={
                <PrivateRoute>
                  <Books />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/members" 
              element={
                <AdminRoute>
                  <Members />
                </AdminRoute>
              } 
            />
            <Route 
              path="/borrows" 
              element={
                <PrivateRoute>
                  <Borrows />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/fines" 
              element={
                <PrivateRoute>
                  <Fines />
                </PrivateRoute>
              } 
            />
            <Route path="/" element={
              user ? (
                user.role === 'admin' ? <Navigate to="/admin" /> : <Navigate to="/dashboard" />
              ) : (
                <Navigate to="/login" />
              )
            } />
          </Routes>
        </div>
      </div>
    </div>
  )
}

export default App
