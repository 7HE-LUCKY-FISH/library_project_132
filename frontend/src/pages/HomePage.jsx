import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import { api } from '../api/client';

const roleCards = [
  {
    title: 'Admin',
    description: 'Approve users, manage librarians, and monitor the system.',
    link: '/login/admin',
  },
  {
    title: 'Librarian',
    description: 'Create, update, and remove books from the catalog.',
    link: '/login/librarian',
  },
  {
    title: 'User',
    description: 'Sign up, wait for approval, then browse the book catalog.',
    link: '/login/user',
  },
];

export default function HomePage() {
  const [books, setBooks] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .get('/books')
      .then((data) => setBooks(data.slice(0, 6)))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div className="stack-lg">
      <section className="hero card">
        <div>
          <p className="eyebrow">Your local library</p>
          <h1>Manage Your Books</h1>
          <p>
            Browse our collection, search for titles, and find your next read.
          </p>
        </div>
        <div className="hero-actions">
          <Link className="primary-button" to="/signup">
            Create a User Account
          </Link>
          <Link className="secondary-button" to="/login/admin">
            Open Admin Login
          </Link>
        </div>
      </section>

      <section className="grid-3">
        {roleCards.map((card) => (
          <article key={card.title} className="card role-card">
            <h2>{card.title}</h2>
            <p>{card.description}</p>
            <Link className="secondary-button" to={card.link}>
              Continue
            </Link>
          </article>
        ))}
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Catalog preview</p>
            <h2>Public books endpoint</h2>
          </div>
        </div>
        {error ? <p className="error-text">{error}</p> : null}
        <div className="book-grid">
          {books.length === 0 ? (
            <p className="muted-text">No books yet. Log in as a librarian to add the first record.</p>
          ) : (
            books.map((book) => (
              <article key={book.id} className="book-card">
                <div className="book-cover">
                  {book.image_url ? <img src={book.image_url} alt={book.title} /> : <span>No Image</span>}
                </div>
                <div>
                  <h3>{book.title}</h3>
                  <p>{book.genre}</p>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
