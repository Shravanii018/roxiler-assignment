import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar">
      <div className="navbar-brand">Roxiler Ratings</div>
      <div className="navbar-links">
        {!user && <Link to="/login">Login</Link>}
        {!user && <Link to="/signup">Sign Up</Link>}

        {user?.role === 'admin' && <Link to="/admin">Admin Dashboard</Link>}
        {user?.role === 'admin' && <Link to="/admin/users">Users</Link>}
        {user?.role === 'admin' && <Link to="/admin/stores">Stores</Link>}

        {user?.role === 'normal' && <Link to="/stores">Stores</Link>}

        {user?.role === 'owner' && <Link to="/owner">Owner Dashboard</Link>}

        {user && <Link to="/change-password">Change Password</Link>}
        {user && (
          <button className="link-button" onClick={handleLogout}>
            Logout ({user.name.split(' ')[0]})
          </button>
        )}
      </div>
    </nav>
  );
}
