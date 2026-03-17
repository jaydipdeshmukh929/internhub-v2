import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login, googleLogin } from '../services/api';
import { useAuth } from '../context/AuthContext';

const GOOGLE_CLIENT_ID = 'YOUR_GOOGLE_CLIENT_ID'; // Replace with your client ID

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Load Google Sign-In script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.google && GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID') {
        window.google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: handleGoogleResponse,
        });
        window.google.accounts.id.renderButton(
          document.getElementById('google-btn'),
          {
            theme: 'filled_black',
            size: 'large',
            width: '100%',
            text: 'continue_with',
          }
        );
      }
    };
    return () => { document.body.removeChild(script); };
  }, []);

  const handleGoogleResponse = async (response) => {
    setError(''); setLoading(true);
    try {
      const res = await googleLogin({ idToken: response.credential });
      if (res.data.success) {
        signIn(res.data);
        navigate(res.data.role === 'ADMIN' ? '/admin' : '/dashboard');
      } else {
        setError(res.data.message);
      }
    } catch {
      setError('Google login failed. Please try again.');
    } finally { setLoading(false); }
  };

  const submit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await login(form);
      if (res.data.success) {
        signIn(res.data);
        navigate(res.data.role === 'ADMIN' ? '/admin' : '/dashboard');
      } else {
        setError(res.data.message);
      }
    } catch {
      setError('Server error — is the backend running on port 8081?');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">⚡ InternHub</div>
        <p className="auth-subtitle">Welcome back — sign in to continue</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email address</label>
            <input className="form-control" type="email" value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              required placeholder="you@example.com" />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              required placeholder="••••••••" />
          </div>
          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
            <Link to="/forgot-password" style={{ fontSize: '0.82rem', color: 'var(--accent2)' }}>
              Forgot password?
            </Link>
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading}
            style={{ width: '100%', marginBottom: '1rem' }}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '0.5rem 0 1rem' }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>OR</span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Google Sign-In Button */}
        {GOOGLE_CLIENT_ID !== 'YOUR_GOOGLE_CLIENT_ID' ? (
          <div id="google-btn" style={{ width: '100%', marginBottom: '1rem' }} />
        ) : (
          <div style={{
            border: '1px solid var(--border2)', borderRadius: 'var(--radius-sm)',
            padding: '10px', textAlign: 'center', marginBottom: '1rem',
            color: 'var(--text2)', fontSize: '0.85rem', background: 'var(--surface2)'
          }}>
            <span style={{ marginRight: '8px' }}>🔑</span>
            Google Sign-In — add your Client ID to enable
            <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '4px' }}>
              See README for Google Cloud setup steps
            </div>
          </div>
        )}

        {/* JWT info badge */}
        <div style={{
          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)',
          borderRadius: 'var(--radius-sm)', padding: '8px 12px',
          fontSize: '0.78rem', color: 'var(--green)', marginBottom: '1rem',
          display: 'flex', alignItems: 'center', gap: '6px'
        }}>
          🔒 Secured with JWT Authentication
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.88rem', color: 'var(--text2)' }}>
          No account? <Link to="/register" style={{ color: 'var(--accent2)' }}>Register free</Link>
        </p>
      </div>
    </div>
  );
}
