import React, { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { membersAPI, borrowsAPI, finesAPI } from '../services/api'

function Members() {
  const { user } = useAuth()
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState(null)
  const [memberBorrows, setMemberBorrows] = useState([])
  const [memberFines, setMemberFines] = useState([])
  const [editingMember, setEditingMember] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
    address: '',
    role: 'member',
    member_type: 'student'
  })

  useEffect(() => {
    if (user?.role !== 'admin') {
      setLoading(false)
      return
    }
    fetchMembers()
  }, [user])

  const fetchMembers = async () => {
    try {
      const response = await membersAPI.getAll()
      setMembers(response.data.results || response.data)
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMemberDetails = async (memberId) => {
    try {
      const [borrowsRes, finesRes] = await Promise.all([
        borrowsAPI.getAll(),
        finesAPI.getAll()
      ])
      const allBorrows = borrowsRes.data.results || borrowsRes.data
      const allFines = finesRes.data.results || finesRes.data
      
      setMemberBorrows(allBorrows.filter(b => b.member === memberId))
      setMemberFines(allFines.filter(f => f.member === memberId))
    } catch (error) {
      console.error('Error fetching member details:', error)
    }
  }

  const handleViewMember = async (member) => {
    setSelectedMember(member)
    await fetchMemberDetails(member.id)
    setShowDetailModal(true)
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
      if (editingMember) {
        const { password, ...dataWithoutPassword } = formData
        await membersAPI.update(editingMember.id, password ? formData : dataWithoutPassword)
      } else {
        await membersAPI.create(formData)
      }
      setShowModal(false)
      setEditingMember(null)
      setFormData({
        username: '',
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        phone: '',
        address: '',
        role: 'member',
        member_type: 'student'
      })
      fetchMembers()
    } catch (error) {
      console.error('Error saving member:', error)
      alert('Failed to save member. Please try again.')
    }
  }

  const handleEdit = (member) => {
    setEditingMember(member)
    setFormData({
      username: member.username,
      email: member.email,
      password: '',
      first_name: member.first_name || '',
      last_name: member.last_name || '',
      phone: member.phone || '',
      address: member.address || '',
      role: member.role,
      member_type: member.member_type || 'student'
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this member? This will also delete all their borrow records and fines.')) {
      try {
        await membersAPI.delete(id)
        fetchMembers()
      } catch (error) {
        console.error('Error deleting member:', error)
        alert('Failed to delete member.')
      }
    }
  }

  const filteredMembers = (members.results || members).filter(member =>
    member.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (member.first_name && member.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (member.last_name && member.last_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  const getStatusBadge = (status) => {
    switch (status) {
      case 'borrowed':
        return <span className="badge badge-warning">Borrowed</span>
      case 'returned':
        return <span className="badge badge-success">Returned</span>
      case 'overdue':
        return <span className="badge badge-danger">Overdue</span>
      case 'paid':
        return <span className="badge badge-success">Paid</span>
      case 'unpaid':
        return <span className="badge badge-danger">Unpaid</span>
      default:
        return <span className="badge">{status}</span>
    }
  }

  // Redirect non-admins
  if (user?.role !== 'admin') {
    return (
      <div className="access-denied">
        <h1>Access Denied</h1>
        <p>You do not have permission to view this page.</p>
      </div>
    )
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
      <h1>Manage Members</h1>
      
      <div className="search-container">
        <input
          type="text"
          className="form-control"
          placeholder="Search members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          Add Member
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Username</th>
            <th>Name</th>
            <th>Email</th>
            <th>Phone</th>
            <th>Role</th>
            <th>Member Type</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredMembers.map((member) => (
            <tr key={member.id}>
              <td>{member.username}</td>
              <td>{member.first_name} {member.last_name}</td>
              <td>{member.email}</td>
              <td>{member.phone || '-'}</td>
              <td>
                <span className={`badge ${member.role === 'admin' ? 'badge-danger' : 'badge-info'}`}>
                  {member.role}
                </span>
              </td>
              <td>{member.member_type || '-'}</td>
              <td>
                <button 
                  className="btn btn-info" 
                  onClick={() => handleViewMember(member)}
                  style={{ marginRight: '5px' }}
                >
                  View
                </button>
                <button className="btn btn-warning" onClick={() => handleEdit(member)} style={{ marginRight: '5px' }}>
                  Edit
                </button>
                <button className="btn btn-danger" onClick={() => handleDelete(member.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {filteredMembers.length === 0 && (
        <div className="empty-state">
          <h3>No members found</h3>
          <p>Try adjusting your search or add new members.</p>
        </div>
      )}

      {/* Member Detail Modal */}
      {showDetailModal && selectedMember && (
        <div className="modal show">
          <div className="modal-content" style={{ maxWidth: '700px' }}>
            <div className="modal-header">
              <h3>Member Details: {selectedMember.username}</h3>
              <button className="modal-close" onClick={() => setShowDetailModal(false)}>&times;</button>
            </div>
            <div style={{ padding: '20px' }}>
              <div style={{ marginBottom: '20px' }}>
                <h4>Personal Information</h4>
                <p><strong>Name:</strong> {selectedMember.first_name} {selectedMember.last_name}</p>
                <p><strong>Email:</strong> {selectedMember.email}</p>
                <p><strong>Phone:</strong> {selectedMember.phone || '-'}</p>
                <p><strong>Address:</strong> {selectedMember.address || '-'}</p>
                <p><strong>Role:</strong> {selectedMember.role}</p>
                <p><strong>Member Type:</strong> {selectedMember.member_type || '-'}</p>
                <p><strong>Membership Date:</strong> {selectedMember.membership_date ? new Date(selectedMember.membership_date).toLocaleDateString() : '-'}</p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <h4>Borrow History ({memberBorrows.length})</h4>
                {memberBorrows.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Book</th>
                        <th>Borrow Date</th>
                        <th>Due Date</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberBorrows.slice(0, 5).map(borrow => (
                        <tr key={borrow.id}>
                          <td>{borrow.book_title || 'N/A'}</td>
                          <td>{borrow.borrow_date ? new Date(borrow.borrow_date).toLocaleDateString() : '-'}</td>
                          <td>{borrow.due_date ? new Date(borrow.due_date).toLocaleDateString() : '-'}</td>
                          <td>{getStatusBadge(borrow.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No borrow records</p>
                )}
              </div>

              <div>
                <h4>Fines ({memberFines.length})</h4>
                {memberFines.length > 0 ? (
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Book</th>
                        <th>Amount</th>
                        <th>Reason</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {memberFines.map(fine => (
                        <tr key={fine.id}>
                          <td>{fine.book_title || 'N/A'}</td>
                          <td>${fine.amount}</td>
                          <td>{fine.reason}</td>
                          <td>{getStatusBadge(fine.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>No fines</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Member Modal */}
      {showModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingMember ? 'Edit Member' : 'Add Member'}</h3>
              <button className="modal-close" onClick={() => {
                setShowModal(false)
                setEditingMember(null)
              }}>&times;</button>
            </div>
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
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label>Password {editingMember && '(leave blank to keep current)'}</label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  value={formData.password}
                  onChange={handleChange}
                  required={!editingMember}
                />
              </div>
              <div className="form-group">
                <label>First Name</label>
                <input
                  type="text"
                  name="first_name"
                  className="form-control"
                  value={formData.first_name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  className="form-control"
                  value={formData.last_name}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <textarea
                  name="address"
                  className="form-control"
                  value={formData.address}
                  onChange={handleChange}
                  rows="2"
                />
              </div>
              <div className="form-group">
                <label>Role</label>
                <select
                  name="role"
                  className="form-control"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Member Type</label>
                <select
                  name="member_type"
                  className="form-control"
                  value={formData.member_type}
                  onChange={handleChange}
                >
                  <option value="student">Student</option>
                  <option value="teacher">Teacher</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
              <button type="submit" className="btn btn-primary">
                {editingMember ? 'Update' : 'Add'} Member
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Members
