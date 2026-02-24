import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { borrowsAPI } from "../services/api";

function BorrowHistory() {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchRecords = async (currentPage = page) => {
    setLoading(true);
    try {
      const response = await borrowsAPI.getHistory({ page: currentPage, page_size: 10 });
      setRecords(response.data.results || []);
      setCount(response.data.count || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [page]);

  const returnBook = async (id) => {
    await borrowsAPI.returnBook(id);
    fetchRecords();
  };

  const maxPage = Math.max(1, Math.ceil(count / 10));

  return (
    <div>
      <h1>Borrow History</h1>
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                {user?.role !== "member" && <th>Member</th>}
                <th>Book</th>
                <th>Borrow Date</th>
                <th>Due Date</th>
                <th>Return Date</th>
                <th>Fine</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record.id}>
                  {user?.role !== "member" && <td>{record.member_details?.username}</td>}
                  <td>{record.book_details?.title}</td>
                  <td>{new Date(record.borrow_date).toLocaleDateString()}</td>
                  <td>{new Date(record.due_date).toLocaleDateString()}</td>
                  <td>{record.return_date ? new Date(record.return_date).toLocaleDateString() : "-"}</td>
                  <td>${record.fine_amount}</td>
                  <td>{record.status}</td>
                  <td>
                    {record.status !== "returned" && (
                      <button className="btn btn-success" onClick={() => returnBook(record.id)}>
                        Return
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button className="btn btn-primary" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</button>
            <span>Page {page} / {maxPage}</span>
            <button className="btn btn-primary" disabled={page >= maxPage} onClick={() => setPage(page + 1)}>Next</button>
          </div>
        </>
      )}
    </div>
  );
}

export default BorrowHistory;
