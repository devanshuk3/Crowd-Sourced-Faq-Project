import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from '@tanstack/react-router';
import toast from 'react-hot-toast';

export default function Nav() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  const loadUser = () => {
    try {
      const userJson = localStorage.getItem('user');
      setUser(userJson ? JSON.parse(userJson) : null);
    } catch (err) {
      console.error(err);
      setUser(null);
    }
  };

  useEffect(() => {
    loadUser();

    // Listen to local storage changes to keep user state reactive
    window.addEventListener('storage', loadUser);
    return () => {
      window.removeEventListener('storage', loadUser);
    };
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('user');
    setUser(null);
    toast.success('Signed out successfully');
    navigate({ to: '/' });
  };

  return (
    <nav>
      <div className="container nav-inner" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
          <Link to="/" className="nav-logo">
            Sama<span>gama</span> FAQ
          </Link>
          <ul className="nav-links">
            <li><Link to="/" className={pathname === '/' ? 'active' : ''}>Browse</Link></li>
            <li><Link to="/ask" className={pathname === '/ask' ? 'active' : ''}>Ask</Link></li>
            <li><Link to="/answer" className={pathname === '/answer' ? 'active' : ''}>Answer</Link></li>
            <li><Link to="/stats" className={pathname === '/stats' ? 'active' : ''}>Stats</Link></li>
            {user?.role === 'admin' && (
              <li><Link to="/admin" className={pathname === '/admin' ? 'active' : ''}>Admin</Link></li>
            )}
          </ul>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <span className="mono" style={{ fontSize: '0.78rem', color: 'var(--gray-600)', borderRight: '1px solid var(--border)', paddingRight: 14 }}>
                {user.name} <em style={{ fontStyle: 'normal', color: 'var(--black)', fontWeight: 600 }}>({user.role.toUpperCase()})</em>
              </span>
              <button
                onClick={handleSignOut}
                className="btn btn-ghost btn-sm"
                style={{ fontSize: '0.7rem' }}
              >
                Sign Out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="btn btn-filled btn-sm"
              style={{ fontSize: '0.7rem', padding: '5px 12px' }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
