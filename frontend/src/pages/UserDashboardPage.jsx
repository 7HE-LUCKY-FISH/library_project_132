import { useEffect, useState } from 'react';

import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

export default function UserDashboardPage() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      api.get('/user/dashboard', { token }),
      api.get('/user/books', { token }),
    ])
      .then(([dashboardData, booksData]) => {
        setDashboard(dashboardData);
        setBooks(booksData);
      })
      .catch((err) => setError(err.message));
  }, [token]);

  return (
    <div className="stack-lg">
      <section className="card">
        <p className="eyebrow">User dashboard</p>
        <h1>Your library access</h1>
        {dashboard ? (
          <div className="grid-2">
            <div className="profile-card">
              <h2>{dashboard.profile.first_name} {dashboard.profile.last_name}</h2>
              <p><strong>Username:</strong> {dashboard.profile.username}</p>
              <p><strong>Email:</strong> {dashboard.profile.email}</p>
              <p><strong>Education:</strong> {dashboard.profile.education}</p>
            </div>
            <div className="profile-card">
              <h2>Catalog size</h2>
              <p className="feature-number">{dashboard.total_books}</p>
              <p className="muted-text">books available to browse</p>
            </div>
          </div>
        ) : (
          <p className="muted-text">Loading your dashboard…</p>
        )}
        {error ? <p className="error-text">{error}</p> : null}
      </section>

      <section className="card">
        <p className="eyebrow">Book list</p>
        <h2>Available books</h2>
        {books.length === 0 ? (
          <p className="muted-text">The catalog is empty right now.</p>
        ) : (
          <div className="book-grid">
            {books.map((book) => (
              <article key={book.id} className="book-card">
                <div className="book-cover">
                  {book.image_url ? <img src={book.image_url} alt={book.title} /> : <span>No Image</span>}
                </div>
                <div>
                  <h3>{book.title}</h3>
                  <p>{book.genre}</p>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
