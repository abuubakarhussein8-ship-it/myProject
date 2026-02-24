import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";
import { booksAPI, borrowsAPI, dashboardAPI, finesAPI } from "../services/api";

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [books, setBooks] = useState([]);
  const [history, setHistory] = useState([]);
  const [fines, setFines] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, booksRes, historyRes, finesRes] = await Promise.all([
          dashboardAPI.getStats(),
          booksAPI.getAll({ available: "true", page_size: 5 }),
          borrowsAPI.getHistory({ page_size: 5 }),
          finesAPI.getAll({ page_size: 5 }),
        ]);
        setStats(statsRes.data);
        setBooks(booksRes.data.results || []);
        setHistory(historyRes.data.results || []);
        setFines(finesRes.data.results || []);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="loading"><div className="spinner" /></div>;

  return (
    <div>
      <h1>Member Dashboard</h1>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>{stats?.total_books || 0}</h3>
          <p>Total Books</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.available_books || 0}</h3>
          <p>Available Books</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.my_borrows || 0}</h3>
          <p>Total Borrowed</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.current_borrows || 0}</h3>
          <p>Current Borrowed</p>
        </div>
        <div className="stat-card">
          <h3>${Number(stats?.my_unpaid_fines_total || 0).toFixed(2)}</h3>
          <p>My Total Fine</p>
        </div>
        <div className="stat-card">
          <h3>{stats?.my_unpaid_fines_count || 0}</h3>
          <p>Unpaid Fine Records</p>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Quick Actions</h3>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <Link to="/borrow-book" className="btn btn-primary">Borrow Book</Link>
          <Link to="/books" className="btn btn-success">View All Books</Link>
          <Link to="/fines" className="btn btn-warning">View My Fines</Link>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Available Books</h3>
          <Link to="/books">View all</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Author</th>
              <th>Available</th>
            </tr>
          </thead>
          <tbody>
            {books.map((book) => (
              <tr key={book.id}>
                <td>{book.title}</td>
                <td>{book.author}</td>
                <td>{book.available_quantity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Borrow History</h3>
          <Link to="/borrow-history">View all</Link>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Book</th>
              <th>Due Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item.id}>
                <td>{item.book_details?.title}</td>
                <td>{new Date(item.due_date).toLocaleDateString()}</td>
                <td>{item.status}</td>
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
              <th>Book</th>
              <th>Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {fines.map((fine) => (
              <tr key={fine.id}>
                <td>{fine.book_title || "-"}</td>
                <td>${fine.amount}</td>
                <td>{fine.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p>Logged in as: {user?.member_type || "member"}</p>
    </div>
  );
}

export default Dashboard;
