import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { booksAPI, borrowsAPI, membersAPI } from "../services/api";

function BorrowBook() {
  const { user } = useAuth();
  const isStaff = ["admin", "librarian"].includes(user?.role);
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [form, setForm] = useState({ book: "", member: "", due_date: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    const load = async () => {
      const booksRes = await booksAPI.getAll({ available: "true", page_size: 100 });
      setBooks(booksRes.data.results || []);
      if (isStaff) {
        const membersRes = await membersAPI.getAll({ role: "member", page_size: 100 });
        setMembers(membersRes.data.results || []);
      }
    };
    load();
  }, [isStaff]);

  const submit = async (event) => {
    event.preventDefault();
    setMessage("");
    try {
      const payload = {
        book: Number(form.book),
      };
      if (form.due_date) payload.due_date = form.due_date;
      if (isStaff && form.member) payload.member = Number(form.member);
      await borrowsAPI.borrow(payload);
      setMessage("Book borrowed successfully.");
      setForm({ book: "", member: "", due_date: "" });
    } catch (error) {
      const data = error.response?.data || {};
      const firstError =
        data.book?.[0] ||
        data.member?.[0] ||
        data.due_date?.[0] ||
        data.non_field_errors?.[0] ||
        data.detail;
      setMessage(firstError || "Borrow failed.");
    }
  };

  return (
    <div>
      <h1>Borrow Book</h1>
      {message && <div className="alert alert-warning">{message}</div>}
      <div className="card">
        <form onSubmit={submit}>
          {isStaff && (
            <div className="form-group">
              <label>Member</label>
              <select className="form-control" value={form.member} onChange={(e) => setForm({ ...form, member: e.target.value })}>
                <option value="">Select member (optional)</option>
                {members.map((member) => (
                  <option key={member.id} value={member.id}>{member.username}</option>
                ))}
              </select>
            </div>
          )}
          <div className="form-group">
            <label>Book</label>
            <select className="form-control" value={form.book} onChange={(e) => setForm({ ...form, book: e.target.value })} required>
              <option value="">Select book</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>
                  {book.title} ({book.available_quantity} available)
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Due Date (optional)</label>
            <input type="datetime-local" className="form-control" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          </div>
          <button className="btn btn-primary" type="submit">Borrow</button>
        </form>
      </div>
    </div>
  );
}

export default BorrowBook;
