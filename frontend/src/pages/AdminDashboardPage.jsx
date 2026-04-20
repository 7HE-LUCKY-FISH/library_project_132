import { useEffect, useMemo, useState } from 'react';

import { api } from '../api/client';
import { useAuth } from '../auth/AuthContext';
import StatusBadge from '../components/StatusBadge';

const emptyLibrarianForm = {
  first_name: '',
  last_name: '',
  email: '',
  position: '',
  password: '',
  is_active: true,
};

export default function AdminDashboardPage() {
  const { token } = useAuth();
  const [dashboard, setDashboard] = useState(null);
  const [users, setUsers] = useState([]);
  const [librarians, setLibrarians] = useState([]);
  const [form, setForm] = useState(emptyLibrarianForm);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const pendingUsers = useMemo(() => users.filter((user) => !user.is_approved), [users]);

  const loadData = async () => {
    setError('');
    try {
      const [dashboardData, userData, librarianData] = await Promise.all([
        api.get('/admin/dashboard', { token }),
        api.get('/admin/users', { token }),
        api.get('/admin/librarians', { token }),
      ]);
      setDashboard(dashboardData);
      setUsers(userData);
      setLibrarians(librarianData);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    loadData();
  }, [token]);

  const clearForm = () => {
    setEditingId(null);
    setForm(emptyLibrarianForm);
  };

  const saveLibrarian = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');

    try {
      if (editingId) {
        await api.put(`/admin/librarians/${editingId}`, form, { token });
        setMessage('Librarian updated successfully.');
      } else {
        await api.post('/admin/librarians', form, { token });
        setMessage('Librarian created successfully.');
      }
      clearForm();
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const approveUser = async (userId) => {
    setError('');
    try {
      await api.patch(`/admin/users/${userId}/approve`, {}, { token });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user?')) return;
    setError('');
    try {
      await api.delete(`/admin/users/${userId}`, { token });
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  const editLibrarian = (librarian) => {
    setEditingId(librarian.id);
    setForm({
      first_name: librarian.first_name,
      last_name: librarian.last_name,
      email: librarian.email,
      position: librarian.position,
      password: '',
      is_active: librarian.is_active,
    });
  };

  const deleteLibrarian = async (librarianId) => {
    if (!window.confirm('Delete this librarian?')) return;
    setError('');
    try {
      await api.delete(`/admin/librarians/${librarianId}`, { token });
      if (editingId === librarianId) {
        clearForm();
      }
      await loadData();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="stack-lg">
      <section className="card">
        <p className="eyebrow">Admin dashboard</p>
        <h1>System overview</h1>
        {dashboard ? (
          <div className="stats-grid">
            <div className="stat-card">
              <span>Total users</span>
              <strong>{dashboard.total_users}</strong>
            </div>
            <div className="stat-card">
              <span>Pending approvals</span>
              <strong>{dashboard.pending_users}</strong>
            </div>
            <div className="stat-card">
              <span>Librarians</span>
              <strong>{dashboard.total_librarians}</strong>
            </div>
            <div className="stat-card">
              <span>Books</span>
              <strong>{dashboard.total_books}</strong>
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
          <div className="section-heading">
            <div>
              <p className="eyebrow">User approvals</p>
              <h2>Pending users</h2>
            </div>
          </div>
          {pendingUsers.length === 0 ? (
            <p className="muted-text">No pending approvals.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Education</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {pendingUsers.map((user) => (
                    <tr key={user.id}>
                      <td>{user.first_name} {user.last_name}</td>
                      <td>{user.email}</td>
                      <td>{user.education}</td>
                      <td>
                        <button className="primary-button small-button" onClick={() => approveUser(user.id)}>
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </article>

        <article className="card">
          <p className="eyebrow">Librarian management</p>
          <h2>{editingId ? 'Edit librarian' : 'Add librarian'}</h2>
          <form className="stack-md" onSubmit={saveLibrarian}>
            <label>
              First name
              <input value={form.first_name} onChange={(e) => setForm((prev) => ({ ...prev, first_name: e.target.value }))} required />
            </label>
            <label>
              Last name
              <input value={form.last_name} onChange={(e) => setForm((prev) => ({ ...prev, last_name: e.target.value }))} required />
            </label>
            <label>
              Email
              <input type="email" value={form.email} onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))} required />
            </label>
            <label>
              Position
              <input value={form.position} onChange={(e) => setForm((prev) => ({ ...prev, position: e.target.value }))} required />
            </label>
            <label>
              Password {editingId ? '(leave blank to keep current password)' : ''}
              <input type="password" value={form.password} onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))} required={!editingId} />
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm((prev) => ({ ...prev, is_active: e.target.checked }))}
              />
              Active account
            </label>
            <div className="row-actions">
              <button className="primary-button" type="submit">
                {editingId ? 'Save Changes' : 'Create Librarian'}
              </button>
              {editingId ? (
                <button className="secondary-button" type="button" onClick={clearForm}>
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </article>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Accounts</p>
            <h2>All users</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Username</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.first_name} {user.last_name}</td>
                  <td>{user.email}</td>
                  <td>{user.username}</td>
                  <td>
                    <StatusBadge tone={user.is_approved ? 'success' : 'warning'}>
                      {user.is_approved ? 'Approved' : 'Pending'}
                    </StatusBadge>
                  </td>
                  <td>
                    <button className="danger-button small-button" onClick={() => deleteUser(user.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Staff</p>
            <h2>All librarians</h2>
          </div>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Position</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {librarians.map((librarian) => (
                <tr key={librarian.id}>
                  <td>{librarian.first_name} {librarian.last_name}</td>
                  <td>{librarian.email}</td>
                  <td>{librarian.position}</td>
                  <td>
                    <StatusBadge tone={librarian.is_active ? 'success' : 'neutral'}>
                      {librarian.is_active ? 'Active' : 'Inactive'}
                    </StatusBadge>
                  </td>
                  <td>
                    <div className="row-actions compact-actions">
                      <button className="secondary-button small-button" onClick={() => editLibrarian(librarian)}>
                        Edit
                      </button>
                      <button className="danger-button small-button" onClick={() => deleteLibrarian(librarian.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
