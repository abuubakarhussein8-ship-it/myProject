import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    account_type: 'student',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    setLoading(true)

    try {
      const role = formData.account_type === 'student' ? 'member' : formData.account_type
      const memberType = formData.account_type === 'student' ? 'student' : null
      const response = await register({
        username: formData.username,
        password: formData.password,
        password_confirm: formData.password,
        role,
        member_type: memberType,
      })
      
      if (response.data) {
        navigate('/login')
      }
    } catch (err) {
      console.error('Registration error:', err)
      
      let errorMessage = 'Registration failed. Please try again.'
      
      if (err.response) {
        // Server responded with error
        const responseData = err.response.data
        if (typeof responseData === 'object') {
          // Format validation errors
          const errorParts = []
          for (const [key, value] of Object.entries(responseData)) {
            if (Array.isArray(value)) {
              errorParts.push(`${key}: ${value.join(', ')}`)
            } else {
              errorParts.push(`${key}: ${value}`)
            }
          }
          errorMessage = errorParts.join('\n')
        } else {
          errorMessage = responseData.detail || responseData.message || errorMessage
        }
      } else if (err.request) {
        // No response received
        errorMessage = 'Unable to connect to server. Please check if the backend is running.'
      }
      
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Register</h2>
        {error && <div className="alert alert-error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              className="form-control"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Account Type</label>
            <select
              name="account_type"
              className="form-control"
              value={formData.account_type}
              onChange={handleChange}
              required
            >
              <option value="admin">Admin</option>
              <option value="librarian">Librarian</option>
              <option value="student">Student</option>
            </select>
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              className="form-control"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  )
}

export default Register
