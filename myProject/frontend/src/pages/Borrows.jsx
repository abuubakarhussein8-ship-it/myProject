import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { borrowsAPI, booksAPI, membersAPI } from '../services/api'

function Borrows() {
  const { user } = useAuth()
  const [borrows, setBorrows] = useState([])
  const [books, setBooks] = useState([])
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    book: '',
    member: ''
  })

  useEffect(() => {
    fetchBorrows()
    fetchBooks()
    if (user?.role === 'admin') {
      fetchMembers()
    }
  }, [user])

  const fetchBorrows = async () => {
    try {
      const response = await borrowsAPI.getAll()
      setBorrows(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching borrows:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBooks = async () => {
    try {
      const response = await booksAPI.getAll()
      setBooks((response.data.results || response.data).filter(book => book.available_quantity > 0))
    } catch (error) {
      console.error('Error fetching books:', error)
    }
  }

  const fetchMembers = async () => {
    try {
      const response = await membersAPI.getAll()
      setMembers(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching members:', error)
    }
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      // For members, only send book. For admins, send book and optionally member
      const data = { book: formData.book }
      if (user?.role === 'admin' && formData.member) {
        data.member = formData.member
      }
      await borrowsAPI.create(data)
      setShowModal(false)
      setFormData({ book: '', member: '' })
      fetchBorrows()
      fetchBooks()
    } catch (error) {
      console.error('Error borrowing book:', error)
      alert('Failed to borrow book. Please try again.')
    }
  }

  const handleReturn = async (id) => {
    try {
      await borrowsAPI.returnBook(id)
      fetchBorrows()
      fetchBooks()
    } catch (error) {
      console.error('Error returning book:', error)
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'borrowed':
        return <span className="badge badge-warning">Borrowed</span>
      case 'returned':
        return <span className="badge badge-success">Returned</span>
      case 'overdue':
        return <span className="badge badge-danger">Overdue</span>
      case 'pending':
        return <span className="badge badge-info">Pending</span>
      case 'approved':
        return <span className="badge badge-success">Approved</span>
      case 'rejected':
        return <span className="badge badge-danger">Rejected</span>
      default:
        return <span className="badge">{status}</span>
    }
  }

  // Filter borrows for members (show only their own)
  const displayedBorrows = user?.role === 'admin' 
    ? borrows 
    : borrows.filter(borrow => borrow.member === user?.id || borrow.member_details?.id === user?.id)

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div>
      <h1>{user?.role === 'admin' ? 'All Borrows' : 'My Borrows'}</h1>
      
      {user?.role !== 'admin' && (
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginBottom: '20px' }}>
          Borrow Book
        </button>
      )}

      {user?.role === 'admin' && (
        <button className="btn btn-primary" onClick={() => setShowModal(true)} style={{ marginBottom: '20px' }}>
          New Borrow Record
        </button>
      )}

      <table className="table">
        <thead>
          <tr>
            <th>Book</th>
            {user?.role === 'admin' && <th>Member</th>}
            <th>Borrow Date</th>
            <th>Due Date</th>
            <th>Return Date</th>
            <th>Status</th>
            {(borrow) => borrow.status !== 'returned' && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {displayedBorrows.map((borrow) => (
            <tr key={borrow.id}>
              <td>{borrow.book_details?.title || borrow.book_title || 'N/A'}</td>
              {user?.role === 'admin' && (
                <td>{borrow.member_details?.username || borrow.member_username || 'N/A'}</td>
              )}
              <td>{borrow.borrow_date ? new Date(borrow.borrow_date).toLocaleDateString() : '-'}</td>
              <td>{borrow.due_date ? new Date(borrow.due_date).toLocaleDateString() : '-'}</td>
              <td>{borrow.return_date ? new Date(borrow.return_date).toLocaleDateString() : '-'}</td>
              <td>{getStatusBadge(borrow.status)}</td>
              {borrow.status !== 'returned' && (
                <td>
                  <button className="btn btn-success" onClick={() => handleReturn(borrow.id)}>
                    Return
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {displayedBorrows.length === 0 && (
        <div className="empty-state">
          <h3>No borrow records found</h3>
          <p>{user?.role === 'admin' ? 'No borrow records in the system.' : 'Start borrowing books to see them here.'}</p>
        </div>
      )}

      {showModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Borrow Book</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              {user?.role === 'admin' && (
                <div className="form-group">
                  <label>Select Member (leave empty to borrow for yourself)</label>
                  <select
                    name="member"
                    className="form-control"
                    value={formData.member}
                    onChange={handleChange}
                  >
                    <option value="">Select a member (optional)</option>
                    {members.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.username} ({member.first_name} {member.last_name})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div className="form-group">
                <label>Select Book</label>
                <select
                  name="book"
                  className="form-control"
                  value={formData.book}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a book</option>
                  {books.map((book) => (
                    <option key={book.id} value={book.id}>
                      {book.title} by {book.author} (Available: {book.available_quantity})
                    </option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                Borrow Book
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Borrows
