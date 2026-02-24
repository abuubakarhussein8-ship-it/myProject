import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { borrowsAPI, dashboardAPI, finesAPI, membersAPI } from "../services/api";

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentBorrows, setRecentBorrows] = useState([]);
  const [recentFines, setRecentFines] = useState([]);
  const [recentMembers, setRecentMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, borrowsRes, finesRes, membersRes] = await Promise.all([
          dashboardAPI.getStats(),
          borrowsAPI.getAll({ page_size: 8 }),
          finesAPI.getAll({ page_size: 8 }),
          membersAPI.getAll({ role: "member", page_size: 8 }),
        ]);
        setStats(statsRes.data);
        setRecentBorrows(borrowsRes.data.results || []);
        setRecentFines(finesRes.data.results || []);
        setRecentMembers(membersRes.data.results || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <h1>Staff Dashboard</h1>

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
          <h3>${Number(stats?.unpaid_fines_total || 0).toFixed(2)}</h3>
          <p>Unpaid Fines</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Borrow Records</h3>
          <Link to="/borrow-history">View all</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Book</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentBorrows.map((borrow) => (
              <tr key={borrow.id}>
                <td>{borrow.member_details?.username}</td>
                <td>{borrow.book_details?.title}</td>
                <td>{new Date(borrow.due_date).toLocaleDateString()}</td>
                <td>{borrow.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Members</h3>
          <Link to="/members">Manage</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Type</th>
            </tr>
          </thead>
          <tbody>
            {recentMembers.map((member) => (
              <tr key={member.id}>
                <td>{member.username}</td>
                <td>{member.email}</td>
                <td>{member.member_type || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Recent Fines</h3>
          <Link to="/fines">View all</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Book</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {recentFines.map((fine) => (
              <tr key={fine.id}>
                <td>{fine.member_details?.username}</td>
                <td>{fine.book_title || "-"}</td>
                <td>${fine.amount}</td>
                <td>{fine.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminDashboard;
