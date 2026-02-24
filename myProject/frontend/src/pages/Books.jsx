import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { booksAPI } from "../services/api";

const INITIAL_FORM = {
  title: "",
  author: "",
  isbn: "",
  category: "other",
  quantity: 1,
  published_date: "",
};

function Books() {
  const { user } = useAuth();
  const isStaff = ["admin", "librarian"].includes(user?.role);
  const [books, setBooks] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState(INITIAL_FORM);

  const fetchBooks = async (currentPage = page, currentSearch = search) => {
    setLoading(true);
    try {
      const response = await booksAPI.getAll({
        page: currentPage,
        page_size: 10,
        search: currentSearch || undefined,
      });
      setBooks(response.data.results || []);
      setCount(response.data.count || 0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, [page]);

  const openCreate = () => {
    setEditingBook(null);
    setFormData(INITIAL_FORM);
    setShowModal(true);
  };

  const openEdit = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      quantity: book.quantity,
      published_date: book.published_date || "",
    });
    setShowModal(true);
  };

  const submitForm = async (event) => {
    event.preventDefault();
    if (editingBook) await booksAPI.update(editingBook.id, formData);
    else await booksAPI.create(formData);
    setShowModal(false);
    fetchBooks();
  };

  const deleteBook = async (id) => {
    if (!window.confirm("Delete this book?")) return;
    await booksAPI.delete(id);
    fetchBooks();
  };

  const maxPage = Math.max(1, Math.ceil(count / 10));

  return (
    <div>
      <h1>Books Management</h1>

      <div className="search-container">
        <input
          type="text"
          className="form-control"
          placeholder="Search by title, author, ISBN"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <button className="btn btn-primary" onClick={() => { setPage(1); fetchBooks(1, search); }}>
          Search
        </button>
        {isStaff && (
          <button className="btn btn-success" onClick={openCreate}>
            Add Book
          </button>
        )}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : (
        <>
          <table className="table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>ISBN</th>
                <th>Category</th>
                <th>Available</th>
                <th>Total</th>
                {isStaff && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr key={book.id}>
                  <td>{book.title}</td>
                  <td>{book.author}</td>
                  <td>{book.isbn}</td>
                  <td>{book.category}</td>
                  <td>{book.available_quantity}</td>
                  <td>{book.quantity}</td>
                  {isStaff && (
                    <td>
                      <button className="btn btn-warning" onClick={() => openEdit(book)}>Edit</button>
                      <button className="btn btn-danger" onClick={() => deleteBook(book.id)}>Delete</button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ display: "flex", gap: "10px", alignItems: "center", marginTop: "16px" }}>
            <button className="btn btn-primary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
              Prev
            </button>
            <span>Page {page} / {maxPage}</span>
            <button className="btn btn-primary" disabled={page >= maxPage} onClick={() => setPage(page + 1)}>
              Next
            </button>
          </div>
        </>
      )}

      {showModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingBook ? "Edit Book" : "Add Book"}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={submitForm}>
              <div className="form-group">
                <label>Title</label>
                <input className="form-control" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Author</label>
                <input className="form-control" value={formData.author} onChange={(e) => setFormData({ ...formData, author: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>ISBN</label>
                <input className="form-control" value={formData.isbn} onChange={(e) => setFormData({ ...formData, isbn: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })}>
                  <option value="fiction">fiction</option>
                  <option value="non-fiction">non-fiction</option>
                  <option value="science">science</option>
                  <option value="technology">technology</option>
                  <option value="history">history</option>
                  <option value="mathematics">mathematics</option>
                  <option value="arts">arts</option>
                  <option value="biography">biography</option>
                  <option value="reference">reference</option>
                  <option value="other">other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Quantity</label>
                <input type="number" min="1" className="form-control" value={formData.quantity} onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })} required />
              </div>
              <div className="form-group">
                <label>Published Date</label>
                <input type="date" className="form-control" value={formData.published_date} onChange={(e) => setFormData({ ...formData, published_date: e.target.value })} />
              </div>
              <button className="btn btn-primary" type="submit">Save</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Books;
