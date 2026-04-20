import { useEffect, useState } from 'react';

import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

const emptyBookForm = {
  title: '',
  genre: '',
  image_url: '',
};

export default function LibrarianDashboardPage() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [books, setBooks] = useState([]);
  const [bookForm, setBookForm] = useState(emptyBookForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const loadData = async () => {
    setError('');
    try {
      const [dashboardData, booksData] = await Promise.all([
        api.get('/librarian/dashboard', { token }),
        api.get('/librarian/books', { token }),
      ]);
      setDashboard(dashboardData);
      setBooks(booksData);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const clearBookForm = () => {
    setEditingId(null);
    setBookForm(emptyBookForm);
  };

  const saveBook = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      const payload = {
        ...bookForm,
        image_url: bookForm.image_url || null,
      };
      if (editingId) {
        await api.put(`/librarian/books/${editingId}`, payload, { token });
        setMessage('Book updated successfully.');
      } else {
        await api.post('/librarian/books', payload, { token });
        setMessage('Book created successfully.');
      }
      clearBookForm();
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const editBook = (book) => {
    setEditingId(book.id);
    setBookForm({
      title: book.title,
      genre: book.genre,
      image_url: book.image_url || '',
    });
  };

  const deleteBook = async (bookId) => {
    if (!window.confirm('Delete this book?')) return;
    setError('');
    try {
      await api.delete(`/librarian/books/${bookId}`, { token });
      if (editingId === bookId) {
        clearBookForm();
      }
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="stack-lg">
      <section className="card">
        <p className="eyebrow">Librarian dashboard</p>
        <h1>Catalog management</h1>
        {dashboard ? (
          <div className="stats-grid">
            <div className="stat-card">
              <span>Books in catalog</span>
              <strong>{dashboard.total_books}</strong>
            </div>
            <div className="stat-card">
              <span>Active librarians</span>
              <strong>{dashboard.active_librarians}</strong>
            </div>
          </div>
        ) : (
          <p className="muted-text">Loading dashboard…</p>
        )}
        {error ? <p className="error-text">{error}</p> : null}
        {message ? <p className="success-text">{message}</p> : null}
      </section>

      <section className="grid-2">
        <article className="card">
          <p className="eyebrow">Book editor</p>
          <h2>{editingId ? 'Update book' : 'Add a new book'}</h2>
          <form className="stack-md" onSubmit={saveBook}>
            <label>
              Title
              <input value={bookForm.title} onChange={(e) => setBookForm((prev) => ({ ...prev, title: e.target.value }))} required />
            </label>
            <label>
              Genre / Description
              <textarea value={bookForm.genre} onChange={(e) => setBookForm((prev) => ({ ...prev, genre: e.target.value }))} rows={5} required />
            </label>
            <label>
              Cover image URL (optional)
              <input value={bookForm.image_url} onChange={(e) => setBookForm((prev) => ({ ...prev, image_url: e.target.value }))} />
            </label>
            <div className="row-actions">
              <button className="primary-button" type="submit">
                {editingId ? 'Save Changes' : 'Add Book'}
              </button>
              {editingId ? (
                <button className="secondary-button" type="button" onClick={clearBookForm}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </article>

        <article className="card">
          <p className="eyebrow">Current catalog</p>
          <h2>Books</h2>
          {books.length === 0 ? <p className="muted-text">No books yet.</p> : null}
          <div className="stack-sm">
            {books.map((book) => (
              <article key={book.id} className="catalog-item">
                <div className="catalog-main">
                  <h3>{book.title}</h3>
                  <p>{book.genre}</p>
                </div>
                <div className="row-actions compact-actions">
                  <button className="secondary-button small-button" onClick={() => editBook(book)}>
                    Edit
                  </button>
                  <button className="danger-button small-button" onClick={() => deleteBook(book.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
