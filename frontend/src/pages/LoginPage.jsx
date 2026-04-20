import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';

const roleConfig = {
  admin: {
    title: 'Admin Login',
    identifierLabel: 'Username',
    endpoint: '/auth/admin/login',
    redirectTo: '/admin',
  },
  librarian: {
    title: 'Librarian Login',
    identifierLabel: 'Email',
    endpoint: '/auth/librarian/login',
    redirectTo: '/librarian',
  },
  user: {
    title: 'User Login',
    identifierLabel: 'Email',
    endpoint: '/auth/user/login',
    redirectTo: '/user',
  },
};

export default function LoginPage() {
  const { role = 'user' } = useParams();
  const config = useMemo(() => roleConfig[role] || roleConfig.user, [role]);
  const navigate = useNavigate();
  const { login } = useAuth();
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = await api.post(config.endpoint, form);
      login(payload);
      navigate(config.redirectTo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card form-card narrow-card">
      <p className="eyebrow">Authentication</p>
      <h1>{config.title}</h1>
      <p className="muted-text">Use the role-specific credentials to access the dashboard.</p>
      <form className="stack-md" onSubmit={handleSubmit}>
        <label>
          {config.identifierLabel}
          <input
            value={form.identifier}
            onChange={(event) => setForm((prev) => ({ ...prev, identifier: event.target.value }))}
            required
          />
        </label>
        <label>
          Password
          <input
            type="password"
            value={form.password}
            onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            required
          />
        </label>
        {error ? <p className="error-text">{error}</p> : null}
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Signing In…' : 'Sign In'}
        </button>
      </form>
    </section>
  );
}
