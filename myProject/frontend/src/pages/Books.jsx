import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { booksAPI } from '../services/api';

function Books() {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    isbn: '',
    category: '',
    description: '',
    publisher: '',
    publish_year: '',
    quantity: 1
  });

  useEffect(() => {
    fetchBooks();
  }, []);

  // Fetch books
  const fetchBooks = async () => {
    try {
      const response = await booksAPI.getAll();
      setBooks(response.data.results || response.data);
    } catch (error) {
      console.error('Error fetching books:', error);
    } finally {
      setLoading(false);
    }
  };

  // Open modal (Add)
  const openAddModal = () => {
    setEditingBook(null);
    setFormData({
      title: '',
      author: '',
      isbn: '',
      category: '',
      description: '',
      publisher: '',
      publish_year: '',
      quantity: 1
    });
    setShowModal(true);
  };

  // Open modal (Edit)
  const openEditModal = (book) => {
    setEditingBook(book);
    setFormData({
      title: book.title,
      author: book.author,
      isbn: book.isbn,
      category: book.category,
      description: book.description || '',
      publisher: book.publisher || '',
      publish_year: book.publish_year || '',
      quantity: book.quantity
    });
    setShowModal(true);
  };

  // Handle input change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Submit form (Add or Update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataToSend = {
      ...formData,
      publish_year: formData.publish_year ? parseInt(formData.publish_year) : null,
      quantity: parseInt(formData.quantity)
    };

    try {
      if (editingBook) {
        await booksAPI.update(editingBook.id, dataToSend);
      } else {
        await booksAPI.create(dataToSend);
      }

      setShowModal(false);
      setEditingBook(null);
      fetchBooks();
    } catch (error) {
      console.error('Error saving book:', error);
    }
  };

  // Delete book
  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await booksAPI.delete(id);
        fetchBooks();
      } catch (error) {
        console.error('Error deleting book:', error);
      }
    }
  };

  // Filter books
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBooks = books.filter(book =>
    (book.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (book.author?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (book.isbn?.toString().toLowerCase() || '').includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading">
        <div className="spinner"></div>
      </div>
    );
  }

  const isAdmin = user?.role === 'admin' || user?.is_staff;

  return (
    <div>
      <h1>Books</h1>

      <div className="search-container">
        <input
          type="text"
          className="form-control"
          placeholder="Search books..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        {isAdmin && (
          <button className="btn btn-primary" onClick={openAddModal}>
            Add Book
          </button>
        )}
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Author</th>
            <th>ISBN</th>
            <th>Category</th>
            <th>Available</th>
            <th>Total</th>
            {isAdmin && <th>Actions</th>}
          </tr>
        </thead>
        <tbody>
          {filteredBooks.map((book) => (
            <tr key={book.id}>
              <td>{book.title}</td>
              <td>{book.author}</td>
              <td>{book.isbn}</td>
              <td>{book.category}</td>
              <td>
                <span className={`badge ${book.available_quantity > 0 ? 'badge-success' : 'badge-danger'}`}>
                  {book.available_quantity}
                </span>
              </td>
              <td>{book.quantity}</td>

              {isAdmin && (
                <td>
                  <button
                    className="btn btn-warning"
                    onClick={() => openEditModal(book)}
                    style={{ marginRight: '5px' }}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-danger"
                    onClick={() => handleDelete(book.id)}
                  >
                    Delete
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {filteredBooks.length === 0 && (
        <div className="empty-state">
          <h3>No books found</h3>
          <p>Try adjusting your search or add new books.</p>
        </div>
      )}

      {showModal && (
        <div className="modal show">
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editingBook ? 'Edit Book' : 'Add Book'}</h3>
              <button
                className="modal-close"
                onClick={() => setShowModal(false)}
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  name="title"
                  className="form-control"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Author</label>
                <input
                  type="text"
                  name="author"
                  className="form-control"
                  value={formData.author}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>ISBN</label>
                <input
                  type="text"
                  name="isbn"
                  className="form-control"
                  value={formData.isbn}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  className="form-control"
                  value={formData.category}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  className="form-control"
                  value={formData.description}
                  onChange={handleChange}
                  rows="3"
                />
              </div>

              <div className="form-group">
                <label>Publisher</label>
                <input
                  type="text"
                  name="publisher"
                  className="form-control"
                  value={formData.publisher}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Publish Year</label>
                <input
                  type="number"
                  name="publish_year"
                  className="form-control"
                  value={formData.publish_year}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Quantity</label>
                <input
                  type="number"
                  name="quantity"
                  className="form-control"
                  value={formData.quantity}
                  onChange={handleChange}
                  min="1"
                  required
                />
              </div>

              <button type="submit" className="btn btn-primary">
                {editingBook ? 'Update' : 'Add'} Book
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Books;