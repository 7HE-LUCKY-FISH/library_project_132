import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { api } from '../api/client';

const initialForm = {
  first_name: '',
  last_name: '',
  email: '',
  username: '',
  education: '',
  password: '',
};

export default function UserSignupPage() {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const updateField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await api.post('/auth/user/signup', form);
      setMessage(response.message);
      setForm(initialForm);
      window.setTimeout(() => navigate('/login/user'), 900);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="card form-card">
      <p className="eyebrow">User onboarding</p>
      <h1>Create an account</h1>
      <p className="muted-text">New users stay pending until an admin approves the request.</p>
      <form className="grid-2" onSubmit={handleSubmit}>
        <label>
          First name
          <input value={form.first_name} onChange={(e) => updateField('first_name', e.target.value)} required />
        </label>
        <label>
          Last name
          <input value={form.last_name} onChange={(e) => updateField('last_name', e.target.value)} required />
        </label>
        <label>
          Email
          <input type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} required />
        </label>
        <label>
          Username
          <input value={form.username} onChange={(e) => updateField('username', e.target.value)} required />
        </label>
        <label>
          Education / Position
          <input value={form.education} onChange={(e) => updateField('education', e.target.value)} required />
        </label>
        <label>
          Password
          <input type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} required />
        </label>
        <div className="grid-span-2 stack-sm">
          {error ? <p className="error-text">{error}</p> : null}
          {message ? <p className="success-text">{message}</p> : null}
          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? 'Creating…' : 'Create Account'}
          </button>
        </div>
      </form>
    </section>
  );
}
