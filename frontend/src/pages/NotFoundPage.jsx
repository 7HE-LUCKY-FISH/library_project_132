import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <section className="card narrow-card">
      <p className="eyebrow">404</p>
      <h1>Page not found</h1>
      <p className="muted-text">The route you requested does not exist.</p>
      <Link className="primary-button" to="/">
        Back to home
      </Link>
    </section>
  );
}
