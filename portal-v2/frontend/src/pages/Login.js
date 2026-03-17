import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login, verify2FA } from '../services/api';
import { useAuth } from '../context/AuthContext';
import PasswordStrength from '../components/PasswordStrength';

export default function Login() {
  const { signIn } = useAuth();
  const navigate   = useNavigate();
  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');
  // 2FA state
  const [requires2FA, setRequires2FA] = useState(false);
  const [twoFACode, setTwoFACode]     = useState('');

  const getDevice = () => {
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'Mobile Browser';
    if (/mac/i.test(ua))    return 'Mac';
    if (/windows/i.test(ua))return 'Windows PC';
    return 'Unknown Device';
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const r = await login({ email, password, device: getDevice(), rememberMe });
      if (r.data.requires2FA) {
        setRequires2FA(true);
      } else if (r.data.success) {
        localStorage.setItem('token', r.data.token);
        signIn(r.data);
        navigate(r.data.role === 'ADMIN' ? '/admin' : '/dashboard');
      } else {
        setError(r.data.message);
      }
    } catch { setError('Login failed. Please try again.'); }
    finally { setLoading(false); }
  };

  const handle2FA = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const r = await verify2FA({ email, code: twoFACode });
      if (r.data.success) {
        localStorage.setItem('token', r.data.token);
        signIn(r.data);
        navigate(r.data.role === 'ADMIN' ? '/admin' : '/dashboard');
      } else {
        setError(r.data.message);
      }
    } catch { setError('Verification failed.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/home" className="brand" style={{ display:'block', textAlign:'center', marginBottom:'1.5rem', fontSize:'1.4rem' }}>
          ⚡ InternHub
        </Link>

        {!requires2FA ? (
          <>
            <h2 style={{ textAlign:'center', marginBottom:'0.5rem' }}>Welcome back</h2>
            <p style={{ textAlign:'center', color:'var(--text2)', fontSize:'0.88rem', marginBottom:'1.5rem' }}>
              Don't have an account? <Link to="/register" style={{ color:'var(--accent2)' }}>Register</Link>
            </p>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Email</label>
                <input className="form-control" type="email" placeholder="you@example.com"
                  value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input className="form-control" type="password" placeholder="Your password"
                  value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.2rem' }}>
                <label style={{ display:'flex', gap:'8px', alignItems:'center', cursor:'pointer', fontSize:'0.85rem', color:'var(--text2)' }}>
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                    style={{ accentColor:'var(--accent)' }} />
                  Remember me (30 days)
                </label>
                <Link to="/forgot-password" style={{ fontSize:'0.82rem', color:'var(--accent2)' }}>
                  Forgot password?
                </Link>
              </div>
              <button className="btn btn-primary" type="submit" style={{ width:'100%' }} disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ textAlign:'center', marginBottom:'1.5rem' }}>
              <div style={{ fontSize:'3rem', marginBottom:'10px' }}>🔐</div>
              <h2 style={{ marginBottom:'6px' }}>2FA Verification</h2>
              <p style={{ color:'var(--text2)', fontSize:'0.85rem' }}>
                A 6-digit code has been sent to <strong>{email}</strong>
              </p>
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <form onSubmit={handle2FA}>
              <div className="form-group">
                <label>Enter 6-digit code</label>
                <input className="form-control" type="text" placeholder="123456" maxLength={6}
                  value={twoFACode} onChange={e => setTwoFACode(e.target.value.replace(/\D/,''))} required
                  style={{ fontSize:'1.4rem', letterSpacing:'0.3em', textAlign:'center' }} />
              </div>
              <button className="btn btn-primary" type="submit" style={{ width:'100%' }} disabled={loading || twoFACode.length < 6}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>
              <button type="button" className="btn btn-outline" style={{ width:'100%', marginTop:'8px' }}
                onClick={() => { setRequires2FA(false); setTwoFACode(''); setError(''); }}>
                ← Back to Login
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
