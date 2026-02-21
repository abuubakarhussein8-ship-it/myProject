import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { dashboardAPI, booksAPI, borrowsAPI, finesAPI, membersAPI } from '../services/api'

function AdminDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [recentBooks, setRecentBooks] = useState([])
  const [recentBorrows, setRecentBorrows] = useState([])
  const [recentFines, setRecentFines] = useState([])
  const [allMembers, setAllMembers] = useState([])
  const [allBorrows, setAllBorrows] = useState([])
  const [allFines, setAllFines] = useState([])
  const [loading, setLoading] = useState(true)
  const [showBookForm, setShowBookForm] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [bookForm, setBookForm] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    quantity: 1,
    description: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [statsRes, booksRes, borrowsRes, finesRes, membersRes] = await Promise.all([
        dashboardAPI.getStats(),
        booksAPI.getAll(),
        borrowsAPI.getAll(),
        finesAPI.getAll(),
        membersAPI.getAll()
      ])
      setStats(statsRes.data)
      setRecentBooks((booksRes.data.results || booksRes.data).slice(0, 5))
      setRecentBorrows((borrowsRes.data.results || borrowsRes.data).slice(0, 10))
      setRecentFines((finesRes.data.results || finesRes.data).slice(0, 5))
      setAllMembers(membersRes.data.results || membersRes.data)
      setAllBorrows(borrowsRes.data.results || borrowsRes.data)
      setAllFines(finesRes.data.results || finesRes.data)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleBookSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingBook) {
        await booksAPI.update(editingBook.id, bookForm)
      } else {
        await booksAPI.create(bookForm)
      }
      setShowBookForm(false)
      setEditingBook(null)
      setBookForm({ title: '', author: '', isbn: '', category: '', quantity: 1, description: '' })
      fetchData()
    } catch (error) {
      console.error('Error saving book:', error)
      alert('Failed to save book')
    }
  }

  const handleEditBook = (book) => {
    setEditingBook(book)
    setBookForm({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      quantity: book.quantity,
      description: book.description || ''
    })
    setShowBookForm(true)
  }

  const handleDeleteBook = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await booksAPI.delete(id)
        fetchData()
      } catch (error) {
        console.error('Error deleting book:', error)
        alert('Failed to delete book')
      }
    }
  }

  const handleReturnBook = async (id) => {
    try {
      await borrowsAPI.returnBook(id)
      fetchData()
    } catch (error) {
      console.error('Error returning book:', error)
      alert('Failed to return book')
    }
  }

  const handlePayFine = async (id) => {
    try {
      await finesAPI.payFine(id)
      fetchData()
    } catch (error) {
      console.error('Error paying fine:', error)
      alert('Failed to pay fine')
    }
  }

  // Get member's borrow history
  const getMemberBorrows = (memberId) => {
    return allBorrows.filter(borrow => borrow.member === memberId || borrow.member_details?.id === memberId)
  }

  // Get member's fines
  const getMemberFines = (memberId) => {
    return allFines.filter(fine => fine.member === memberId || fine.member_details?.id === memberId)
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
      case 'paid':
        return <span className="badge badge-success">Paid</span>
      case 'unpaid':
        return <span className="badge badge-danger">Unpaid</span>
      default:
        return <span className="badge">{status}</span>
    }
  }

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    )
  }

  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      
      {/* Tab Navigation */}
      <div className="tabs" style={{ marginBottom: '20px' }}>
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Members Activity
        </button>
        <button 
          className={`tab-btn ${activeTab === 'borrows' ? 'active' : ''}`}
          onClick={() => setActiveTab('borrows')}
        >
          All Borrows
        </button>
        <button 
          className={`tab-btn ${activeTab === 'fines' ? 'active' : ''}`}
          onClick={() => setActiveTab('fines')}
        >
          All Fines
        </button>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <>
          {/* Statistics Cards */}
          <div className="stats-grid">
            <div className="stat-card">
              <h3>{stats?.total_books || 0}</h3>
              <p>Total Books</p>
            </div>
            <div className="stat-card">
              <h3>{stats?.total_members || 0}</h3>
              <p>Total Members</p>
            </div>
            <div className="stat-card">
              <h3>{stats?.active_borrows || 0}</h3>
              <p>Active Borrows</p>
            </div>
            <div className="stat-card">
              <h3>{stats?.total_fines || 0}</h3>
              <p>Total Fines</p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <button className="btn btn-primary" onClick={() => setShowBookForm(true)}>
              + Add New Book
            </button>
          </div>

          {/* Book Form Modal */}
          {showBookForm && (
            <div className="modal">
              <div className="modal-content">
                <h2>{editingBook ? 'Edit Book' : 'Add New Book'}</h2>
                <form onSubmit={handleBookSubmit}>
                  <div className="form-group">
                    <label>Title</label>
                    <input
                      type="text"
                      value={bookForm.title}
                      onChange={(e) => setBookForm({...bookForm, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Author</label>
                    <input
                      type="text"
                      value={bookForm.author}
                      onChange={(e) => setBookForm({...bookForm, author: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>ISBN</label>
                    <input
                      type="text"
                      value={bookForm.isbn}
                      onChange={(e) => setBookForm({...bookForm, isbn: e.target.value})}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <input
                      type="text"
                      value={bookForm.category}
                      onChange={(e) => setBookForm({...bookForm, category: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label>Quantity</label>
                    <input
                      type="number"
                      value={bookForm.quantity}
                      onChange={(e) => setBookForm({...bookForm, quantity: parseInt(e.target.value)})}
                      min="1"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={bookForm.description}
                      onChange={(e) => setBookForm({...bookForm, description: e.target.value})}
                    />
                  </div>
                  <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                      {editingBook ? 'Update' : 'Add'} Book
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-secondary"
                      onClick={() => {
                        setShowBookForm(false)
                        setEditingBook(null)
                        setBookForm({ title: '', author: '', isbn: '', category: '', quantity: 1, description: '' })
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Recent Books Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Books</h2>
              <a href="/books" className="btn-link">View All</a>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Available</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentBooks.map(book => (
                  <tr key={book.id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.isbn}</td>
                    <td>
                      <span className={`badge ${book.available_quantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {book.available_quantity}/{book.quantity}
                      </span>
                    </td>
                    <td>
                      <button className="btn btn-sm btn-primary" onClick={() => handleEditBook(book)}>Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteBook(book.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Borrows Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Borrows</h2>
              <a href="/borrows" className="btn-link">View All</a>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Book</th>
                  <th>Member</th>
                  <th>Borrow Date</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentBorrows.map(borrow => (
                  <tr key={borrow.id}>
                    <td>{borrow.book_details?.title || borrow.book_title || 'N/A'}</td>
                    <td>{borrow.member_details?.username || borrow.member_username || 'N/A'}</td>
                    <td>{borrow.borrow_date ? new Date(borrow.borrow_date).toLocaleDateString() : '-'}</td>
                    <td>{borrow.due_date ? new Date(borrow.due_date).toLocaleDateString() : '-'}</td>
                    <td>{getStatusBadge(borrow.status)}</td>
                    <td>
                      {borrow.status !== 'returned' && (
                        <button className="btn btn-sm btn-primary" onClick={() => handleReturnBook(borrow.id)}>
                          Mark Returned
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Fines Section */}
          <div className="dashboard-section">
            <div className="section-header">
              <h2>Recent Fines</h2>
              <a href="/fines" className="btn-link">View All</a>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Member</th>
                  <th>Book</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {recentFines.map(fine => (
                  <tr key={fine.id}>
                    <td>{fine.member_details?.username || fine.member_username || 'N/A'}</td>
                    <td>{fine.book_title || 'N/A'}</td>
                    <td>${fine.amount}</td>
                    <td>{getStatusBadge(fine.status)}</td>
                    <td>
                      {fine.status !== 'paid' && (
                        <button className="btn btn-sm btn-primary" onClick={() => handlePayFine(fine.id)}>
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Members Activity Tab - Admin can see all members' activities */}
      {activeTab === 'members' && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Members Activity</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Email</th>
                <th>Member Type</th>
                <th>Total Borrows</th>
                <th>Active Borrows</th>
                <th>Total Fines</th>
                <th>Unpaid Fines</th>
              </tr>
            </thead>
            <tbody>
              {allMembers.filter(m => m.role !== 'admin').map(member => {
                const memberBorrows = getMemberBorrows(member.id)
                const memberFines = getMemberFines(member.id)
                const activeBorrows = memberBorrows.filter(b => b.status === 'borrowed' || b.status === 'overdue')
                const unpaidFines = memberFines.filter(f => f.status === 'unpaid')
                const totalFinesAmount = unpaidFines.reduce((sum, f) => sum + parseFloat(f.amount), 0)
                
                return (
                  <tr key={member.id}>
                    <td>{member.username}</td>
                    <td>{member.email}</td>
                    <td>{member.member_type || 'N/A'}</td>
                    <td>{memberBorrows.length}</td>
                    <td>{activeBorrows.length}</td>
                    <td>${totalFinesAmount.toFixed(2)}</td>
                    <td>{unpaidFines.length}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {allMembers.filter(m => m.role !== 'admin').length === 0 && (
            <div className="empty-state">
              <h3>No members found</h3>
            </div>
          )}
        </div>
      )}

      {/* All Borrows Tab */}
      {activeTab === 'borrows' && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>All Borrow Records</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Member</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allBorrows.map(borrow => (
                <tr key={borrow.id}>
                  <td>{borrow.book_details?.title || borrow.book_title || 'N/A'}</td>
                  <td>{borrow.member_details?.username || borrow.member_username || 'N/A'}</td>
                  <td>{borrow.borrow_date ? new Date(borrow.borrow_date).toLocaleDateString() : '-'}</td>
                  <td>{borrow.due_date ? new Date(borrow.due_date).toLocaleDateString() : '-'}</td>
                  <td>{borrow.return_date ? new Date(borrow.return_date).toLocaleDateString() : '-'}</td>
                  <td>{getStatusBadge(borrow.status)}</td>
                  <td>
                    {borrow.status !== 'returned' && (
                      <button className="btn btn-sm btn-primary" onClick={() => handleReturnBook(borrow.id)}>
                        Mark Returned
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* All Fines Tab */}
      {activeTab === 'fines' && (
        <div className="dashboard-section">
          <div className="section-header">
            <h2>All Fine Records</h2>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Book</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Created Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {allFines.map(fine => (
                <tr key={fine.id}>
                  <td>{fine.member_details?.username || fine.member_username || 'N/A'}</td>
                  <td>{fine.book_title || 'N/A'}</td>
                  <td>${fine.amount}</td>
                  <td>{fine.reason}</td>
                  <td>{getStatusBadge(fine.status)}</td>
                  <td>{new Date(fine.created_at).toLocaleDateString()}</td>
                  <td>
                    {fine.status !== 'paid' && (
                      <button className="btn btn-sm btn-primary" onClick={() => handlePayFine(fine.id)}>
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default AdminDashboard
