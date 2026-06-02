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

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Quick Nav Icon Links */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, borderRight: '1.5px solid var(--border)', paddingRight: 18 }}>
            <Link
              to="/"
              title="Browse FAQs"
              style={{
                color: pathname === '/' ? 'var(--black)' : 'var(--gray-400)',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </Link>
            <Link
              to="/ask"
              title="Ask a Question"
              style={{
                color: pathname === '/ask' ? 'var(--black)' : 'var(--gray-400)',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </Link>
            <Link
              to="/answer"
              title="Answer Questions"
              style={{
                color: pathname === '/answer' ? 'var(--black)' : 'var(--gray-400)',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <path d="m9 10 2 2 4-4" />
              </svg>
            </Link>
            <Link
              to="/stats"
              title="Statistics"
              style={{
                color: pathname === '/stats' ? 'var(--black)' : 'var(--gray-400)',
                transition: 'color 0.2s',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="20" x2="18" y2="10" />
                <line x1="12" y1="20" x2="12" y2="4" />
                <line x1="6" y1="20" x2="6" y2="14" />
              </svg>
            </Link>
          </div>

          {/* Session / Sign In Container */}
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
