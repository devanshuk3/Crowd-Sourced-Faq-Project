import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { loginUser, registerUser } from '../api';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (isRegistering) {
      if (!name || !email || !password) {
        toast.error('Name, email, and password are required');
        return;
      }
      if (password.length < 6) {
        toast.error('Password must be at least 6 characters');
        return;
      }
    } else {
      if (!email || !password) {
        toast.error('Email and password are required');
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegistering) {
        // Register user
        const user = await registerUser({ name, email, password });
        
        // Auto-login registered user
        localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new Event('storage'));
        toast.success(`Account created! Welcome, ${user.name}!`);
        navigate({ to: '/' });
      } else {
        // Login user
        const user = await loginUser({ email, password });
        localStorage.setItem('user', JSON.stringify(user));
        window.dispatchEvent(new Event('storage'));
        toast.success(`Welcome back, ${user.name}!`);
        
        if (user.role === 'admin') {
          navigate({ to: '/admin' });
        } else {
          navigate({ to: '/' });
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ maxWidth: 440, padding: '60px 24px' }}>
      <div style={{ border: '2px solid var(--black)', padding: 32, background: 'var(--white)' }}>
        <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', marginBottom: 6, letterSpacing: '-0.01em' }}>
          {isRegistering ? 'Create Account' : 'Sign In'}
        </h2>
        <p style={{ color: 'var(--gray-600)', fontSize: '0.88rem', marginBottom: 28 }}>
          Sama<em>gama</em> FAQ collaborative portal
        </p>

        <form onSubmit={handleSubmit}>
          {isRegistering && (
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
                disabled={loading}
                required
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@example.com"
              disabled={loading}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: 28 }}>
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={loading}
              required
            />
          </div>

          <button
            type="submit"
            className="btn btn-filled"
            style={{ width: '100%', justifyContent: 'center', height: 44 }}
            disabled={loading}
          >
            {loading ? 'Processing...' : isRegistering ? 'Sign Up' : 'Sign In'}
          </button>
        </form>

        <div style={{ marginTop: 24, textAlign: 'center' }}>
          <button
            type="button"
            className="link-btn"
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              textDecoration: 'underline',
              fontSize: '0.82rem',
              color: 'var(--gray-600)',
              fontFamily: 'Outfit, sans-serif'
            }}
            onClick={() => {
              setIsRegistering(!isRegistering);
              setName('');
              setEmail('');
              setPassword('');
            }}
          >
            {isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
