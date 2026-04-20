import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';

import { useAuth } from '../auth/AuthContext';

function dashboardPath(role) {
  if (role === 'admin') return '/admin';
  if (role === 'librarian') return '/librarian';
  if (role === 'user') return '/user';
  return '/';
}

export default function Layout() {
  const { isAuthenticated, role, displayName, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <Link to="/" className="brand">
            CMPE132 Library
          </Link>
          <p className="subtitle">Your local library</p>
        </div>
        <nav className="nav-links">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/signup">User Signup</NavLink>
          {isAuthenticated ? (
            <>
              <NavLink to={dashboardPath(role)}>Dashboard</NavLink>
              <button type="button" className="ghost-button" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login/admin">Admin Login</NavLink>
              <NavLink to="/login/librarian">Librarian Login</NavLink>
              <NavLink to="/login/user">User Login</NavLink>
            </>
          )}
        </nav>
      </header>
      <main className="page-container">
        {isAuthenticated && (
          <section className="session-banner">
            Signed in as <strong>{displayName}</strong> ({role})
          </section>
        )}
        <Outlet />
      </main>
    </div>
  );
}
