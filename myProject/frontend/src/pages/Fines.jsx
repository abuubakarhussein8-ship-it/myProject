import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { finesAPI } from '../services/api'

function Fines() {
  const { user } = useAuth()
  const [fines, setFines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFines()
  }, [user])

  const fetchFines = async () => {
    try {
      const response = await finesAPI.getAll()
      setFines(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching fines:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayFine = async (id) => {
    if (window.confirm('Are you sure you want to pay this fine?')) {
      try {
        await finesAPI.payFine(id)
        fetchFines()
      } catch (error) {
        console.error('Error paying fine:', error)
      }
    }
  }

  const getStatusBadge = (status) => {
    return status === 'paid' ? (
      <span className="badge badge-success">Paid</span>
    ) : (
      <span className="badge badge-danger">Unpaid</span>
    )
  }

  // Filter fines for members (show only their own)
  const displayedFines = user?.role === 'admin' 
    ? fines 
    : fines.filter(fine => fine.member === user?.id || fine.member_details?.id === user?.id)

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <h1>{user?.role === 'admin' ? 'All Fines' : 'My Fines'}</h1>
      
      <table className="table">
        <thead>
          <tr>
            {user?.role === 'admin' && <th>Member</th>}
            <th>Book</th>
            <th>Amount</th>
            <th>Reason</th>
            <th>Created Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {displayedFines.map((fine) => (
            <tr key={fine.id}>
              {user?.role === 'admin' && (
                <td>{fine.member_details?.username || fine.member_username || 'N/A'}</td>
              )}
              <td>{fine.book_title || 'N/A'}</td>
              <td>${fine.amount}</td>
              <td>{fine.reason}</td>
              <td>{new Date(fine.created_at).toLocaleDateString()}</td>
              <td>{getStatusBadge(fine.status)}</td>
              {fine.status !== 'paid' && (
                <td>
                  <button className="btn btn-success" onClick={() => handlePayFine(fine.id)}>
                    {user?.role === 'admin' ? 'Mark as Paid' : 'Pay Fine'}
                  </button>
                </td>
              )}
              {fine.status === 'paid' && <td>-</td>}
            </tr>
          ))}
        </tbody>
      </table>

      {displayedFines.length === 0 && (
        <div className="empty-state">
          <h3>No fines found</h3>
          <p>{user?.role === 'admin' ? 'No fines in the system.' : 'You have no fines.'}</p>
        </div>
      )}
    </div>
  )
}

export default Fines
