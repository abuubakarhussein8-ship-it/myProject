import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { dashboardAPI, booksAPI, membersAPI, finesAPI, borrowsAPI } from '../services/api'

function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [books, setBooks] = useState([])
  const [members, setMembers] = useState([])
  const [fines, setFines] = useState([])
  const [myBorrows, setMyBorrows] = useState([])
  const [myFines, setMyFines] = useState([])
  const [activeBorrows, setActiveBorrows] = useState([])

  useEffect(() => {
    fetchStats()
    fetchTableData()
  }, [user])

  const fetchStats = async () => {
    try {
      const response = await dashboardAPI.getStats()
      setStats(response.data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTableData = async () => {
    try {
      // Always fetch books - both admin and members can view books
      const booksRes = await booksAPI.getAll()
      setBooks(booksRes.data.results || booksRes.data)
      
      if (user?.role === 'admin') {
        // Admin-specific data
        const [membersRes, finesRes, borrowsRes] = await Promise.all([
          membersAPI.getAll(),
          finesAPI.getAll(),
          borrowsAPI.getAll({ status: 'borrowed' })
        ])
        setMembers(membersRes.data.results || membersRes.data)
        setFines(finesRes.data.results || finesRes.data)
        setActiveBorrows(borrowsRes.data.results || borrowsRes.data)
      } else {
        // Member-specific data - fetch their own borrows and fines
        const [borrowsRes, finesRes] = await Promise.all([
          borrowsAPI.getAll(),
          finesAPI.getAll()
        ])
        setMyBorrows(borrowsRes.data.results || borrowsRes.data)
        setMyFines(finesRes.data.results || finesRes.data)
      }
    } catch (error) {
      console.error('Error fetching table data:', error)
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
    <div>
      <h1>Dashboard</h1>
      
      {/* Stats Cards - Different for Admin and Members */}
      {user?.role === 'admin' ? (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats?.total_books || 0}</h3>
            <p>Jumla ya Vitabu</p>
          </div>
          <div className="stat-card">
            <h3>{stats?.total_members || 0}</h3>
            <p>Jumla ya Wanachama</p>
          </div>
          <div className="stat-card">
            <h3>{stats?.active_borrows || 0}</h3>
            <p>Uchapishaji wa Hivi Sasa</p>
          </div>
          <div className="stat-card">
            <h3>{stats?.total_fines || 0}</h3>
            <p>Jumla ya Faini</p>
          </div>
        </div>
      ) : (
        <div className="stats-grid">
          <div className="stat-card">
            <h3>{stats?.my_borrows || 0}</h3>
            <p>Jumla ya Kukopa</p>
          </div>
          <div className="stat-card">
            <h3>{stats?.current_borrows || 0}</h3>
            <p>Vitabu vilivyo kwa Sasa</p>
          </div>
          <div className="stat-card">
            <h3>{stats?.my_fines || 0}</h3>
            <p>Faini zisizolipwa</p>
          </div>
          <div className="stat-card">
            <h3>{books.filter(b => b.available_quantity > 0).length}</h3>
            <p>Vitabu Vinavyopatikana</p>
          </div>
        </div>
      )}

      {/* Welcome Card */}
      <div className="card" style={{ marginTop: '20px' }}>
        <div className="card-header">
          <h3 className="card-title">Karibu, {user?.username}!</h3>
        </div>
        <p>
          Umeingia kama {user?.role === 'admin' ? 'Msimamizi wa Maktaba' : 'Mwanachama'}.
        </p>
        {user?.role === 'admin' ? (
          <p>Tumia menyu ya upande kuzunguka mfumo.</p>
        ) : (
          <p>Unaweza kutafuta vitabu, kukopa vitabu, na kuangalia historia yako ya kukopa.</p>
        )}
      </div>

      {/* Member's My Borrows Table */}
      {user?.role !== 'admin' && myBorrows.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-header">
            <h3 className="card-title">My Borrow History</h3>
            <a href="/borrows" className="btn-link">View All</a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {myBorrows.slice(0, 5).map((borrow) => (
                <tr key={borrow.id}>
                  <td>{borrow.book_details?.title || borrow.book?.title || 'N/A'}</td>
                  <td>{borrow.borrow_date ? new Date(borrow.borrow_date).toLocaleDateString() : '-'}</td>
                  <td>{borrow.due_date ? new Date(borrow.due_date).toLocaleDateString() : 'N/A'}</td>
                  <td>{borrow.return_date ? new Date(borrow.return_date).toLocaleDateString() : '-'}</td>
                  <td>
                    <span className={`badge ${borrow.status === 'returned' ? 'badge-success' : borrow.status === 'overdue' ? 'badge-danger' : 'badge-warning'}`}>
                      {borrow.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Member's My Fines Table */}
      {user?.role !== 'admin' && myFines.length > 0 && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-header">
            <h3 className="card-title">My Fines</h3>
            <a href="/fines" className="btn-link">View All</a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Book</th>
                <th>Amount</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Created Date</th>
              </tr>
            </thead>
            <tbody>
              {myFines.slice(0, 5).map((fine) => (
                <tr key={fine.id}>
                  <td>{fine.book_title || 'N/A'}</td>
                  <td>${fine.amount}</td>
                  <td>{fine.reason}</td>
                  <td>
                    <span className={`badge ${fine.status === 'paid' ? 'badge-success' : 'badge-danger'}`}>
                      {fine.status}
                    </span>
                  </td>
                  <td>{new Date(fine.created_at).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Books Table - Visible to all authenticated users */}
      {user?.role !== 'admin' && (
        <div className="card" style={{ marginTop: '20px' }}>
          <div className="card-header">
            <h3 className="card-title">Available Books</h3>
            <a href="/books" className="btn-link">View All</a>
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Category</th>
                <th>Available</th>
              </tr>
            </thead>
            <tbody>
              {books.length > 0 ? (
                books.slice(0, 5).map((book) => (
                  <tr key={book.id}>
                    <td>{book.title}</td>
                    <td>{book.author}</td>
                    <td>{book.isbn}</td>
                    <td>{book.category}</td>
                    <td>
                      <span className={`badge ${book.available_quantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                        {book.available_quantity} / {book.quantity}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center' }}>No books available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Data Tables for Admin */}
      {user?.role === 'admin' && (
        <div className="dashboard-tables" style={{ marginTop: '20px' }}>
          
          {/* Books Table */}
          <div className="card">
            <div className="card-header">
              <h3 className="card-title">Vitabu (Books)</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Author</th>
                  <th>ISBN</th>
                  <th>Category</th>
                  <th>Inastahili</th>
                </tr>
              </thead>
              <tbody>
                {books.length > 0 ? (
                  books.slice(0, 5).map((book) => (
                    <tr key={book.id}>
                      <td>{book.title}</td>
                      <td>{book.author}</td>
                      <td>{book.isbn}</td>
                      <td>{book.category}</td>
                      <td>{book.available_quantity} / {book.quantity}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>Hakuna vitabu</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Members Table */}
          <div className="card" style={{ marginTop: '20px' }}>
            <div className="card-header">
              <h3 className="card-title">Wanachama (Members)</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Jina la Kwanza</th>
                  <th>Jina la Mwisho</th>
                  <th>Aina</th>
                  <th>Tarehe</th>
                </tr>
              </thead>
              <tbody>
                {members.length > 0 ? (
                  members.slice(0, 5).map((member) => (
                    <tr key={member.id}>
                      <td>{member.username}</td>
                      <td>{member.email}</td>
                      <td>{member.first_name || '-'}</td>
                      <td>{member.last_name || '-'}</td>
                      <td>{member.member_type || 'N/A'}</td>
                      <td>{member.membership_date || 'N/A'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" style={{ textAlign: 'center' }}>Hakuna wanachama</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Fines Table */}
          <div className="card" style={{ marginTop: '20px' }}>
            <div className="card-header">
              <h3 className="card-title">Faini (Fines)</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mwanachama</th>
                  <th>Kiasi</th>
                  <th>Sababu</th>
                  <th>Hali</th>
                  <th>Tarehe ya Kulipwa</th>
                </tr>
              </thead>
              <tbody>
                {fines.length > 0 ? (
                  fines.slice(0, 5).map((fine) => (
                    <tr key={fine.id}>
                      <td>{fine.member_details?.username || fine.member?.username || 'N/A'}</td>
                      <td>${fine.amount}</td>
                      <td>{fine.reason}</td>
                      <td>
                        <span className={`status-badge ${fine.status}`}>
                          {fine.status}
                        </span>
                      </td>
                      <td>{fine.paid_date ? new Date(fine.paid_date).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>Hakuna faini</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Active Borrows Table */}
          <div className="card" style={{ marginTop: '20px' }}>
            <div className="card-header">
              <h3 className="card-title">Uchapishaji wa Hivi Sasa (Active Borrows)</h3>
            </div>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Mwanachama</th>
                  <th>Kitabu</th>
                  <th>Tarehe ya Kukopa</th>
                  <th>Tarehe ya Rudishwa</th>
                  <th>Hali</th>
                </tr>
              </thead>
              <tbody>
                {activeBorrows.length > 0 ? (
                  activeBorrows.slice(0, 5).map((borrow) => (
                    <tr key={borrow.id}>
                      <td>{borrow.member_details?.username || borrow.member?.username || 'N/A'}</td>
                      <td>{borrow.book_details?.title || borrow.book?.title || 'N/A'}</td>
                      <td>{borrow.borrow_date ? new Date(borrow.borrow_date).toLocaleDateString() : '-'}</td>
                      <td>{borrow.due_date ? new Date(borrow.due_date).toLocaleDateString() : 'N/A'}</td>
                      <td>
                        <span className={`status-badge ${borrow.status}`}>
                          {borrow.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>Hakuna uchapishaji hai</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard
