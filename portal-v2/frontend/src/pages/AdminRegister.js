import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const validateInvite  = token  => API.get(`/admin-invite/validate/${token}`);
const registerAdmin   = data   => API.post('/admin-invite/register', data);

export default function AdminRegister() {
  const navigate       = useNavigate();
  const [params]       = useSearchParams();
  const { signIn }     = useAuth();

  const token = params.get('token');
  const email = params.get('email');

  const [validating, setValidating]   = useState(true);
  const [inviteInfo, setInviteInfo]   = useState(null);
  const [inviteError, setInviteError] = useState('');

  const [name, setName]               = useState('');
  const [password, setPassword]       = useState('');
  const [confirm, setConfirm]         = useState('');
  const [showPwd, setShowPwd]         = useState(false);
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');

  useEffect(() => {
    if (!token) { setInviteError('No invitation token found in URL.'); setValidating(false); return; }
    validateInvite(token)
      .then(r => {
        if (r.data.valid) setInviteInfo(r.data);
        else setInviteError(r.data.message);
      })
      .catch(() => setInviteError('Failed to validate invitation. Please try again.'))
      .finally(() => setValidating(false));
  }, [token]);

  const strength = (p) => {
    let s = 0;
    if (p.length >= 6) s++;
    if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const sLabel = ['','Weak','Fair','Good','Strong','Very Strong'];
  const sColor = ['','#ef4444','#f59e0b','#3b82f6','#22c55e','#7c6bff'];
  const s = strength(password);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Passwords do not match'); return; }
    if (password.length < 6)  { setError('Password must be at least 6 characters'); return; }

    setLoading(true);
    try {
      const r = await registerAdmin({ token, name, password });
      if (r.data.success) {
        localStorage.setItem('token', r.data.token);
        signIn(r.data);
        navigate('/admin');
      } else setError(r.data.message);
    } catch { setError('Registration failed. Please try again.'); }
    finally { setLoading(false); }
  };

  // Loading state
  if (validating) return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>⏳</div>
        <p style={{ color: 'var(--text2)' }}>Validating your invitation...</p>
      </div>
    </div>
  );

  // Invalid invite
  if (inviteError) return (
    <div className="auth-page">
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
        <h2 style={{ marginBottom: '0.75rem' }}>Invalid Invitation</h2>
        <p style={{ color: 'var(--text2)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          {inviteError}
        </p>
        <Link to="/login" className="btn btn-primary" style={{ display: 'inline-block' }}>
          Go to Login
        </Link>
      </div>
    </div>
  );

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ maxWidth: '440px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <Link to="/home" className="brand" style={{ fontSize: '1.4rem', display: 'block', marginBottom: '1rem' }}>
            ⚡ InternHub
          </Link>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px',
            background: 'rgba(124,107,255,0.1)', borderRadius: '20px', border: '1px solid rgba(124,107,255,0.3)',
            marginBottom: '1rem' }}>
            <span style={{ fontSize: '1rem' }}>⚡</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--accent2)' }}>Admin Registration</span>
          </div>
          <h2 style={{ marginBottom: '6px' }}>Set Up Your Admin Account</h2>
          <p style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>
            Invited by <strong>{inviteInfo?.invitedBy}</strong>
          </p>
        </div>

        {/* Invite info banner */}
        <div style={{ padding: '12px 16px', background: 'rgba(34,197,94,0.08)',
          border: '1px solid rgba(34,197,94,0.25)', borderRadius: '10px', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <span style={{ fontSize: '1.2rem' }}>✅</span>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--green)' }}>
                Valid Invitation
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginTop: '2px' }}>
                📧 {inviteInfo?.invitedEmail} &nbsp;·&nbsp;
                ⏳ Expires {new Date(inviteInfo?.expiresAt).toLocaleString('en-IN', {
                  day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          {/* Email — pre-filled, locked */}
          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control" type="email" value={inviteInfo?.invitedEmail || email || ''} disabled
              style={{ opacity: 0.7, cursor: 'not-allowed', background: 'var(--surface2)' }} />
            <small style={{ color: 'var(--text3)', fontSize: '0.74rem' }}>
              Email is set by your invitation and cannot be changed.
            </small>
          </div>

          {/* Full name */}
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" type="text" placeholder="Your full name"
              value={name} onChange={e => setName(e.target.value)} required autoFocus />
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input className="form-control" type={showPwd ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={password} onChange={e => setPassword(e.target.value)} required
                style={{ paddingRight: '44px' }} />
              <button type="button" onClick={() => setShowPwd(v => !v)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: '1rem', color: 'var(--text3)' }}>
                {showPwd ? '🙈' : '👁'}
              </button>
            </div>
            {password && (
              <div style={{ marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  {[1,2,3,4,5].map(i => (
                    <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px',
                      background: i <= s ? sColor[s] : 'var(--surface2)', transition: 'background 0.3s' }} />
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', color: sColor[s], fontWeight: 600 }}>{sLabel[s]}</span>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="form-group">
            <label>Confirm Password</label>
            <input className="form-control" type="password" placeholder="Re-enter your password"
              value={confirm} onChange={e => setConfirm(e.target.value)} required
              style={{ borderColor: confirm && confirm !== password ? 'var(--red)' : '' }} />
            {confirm && confirm !== password && (
              <small style={{ color: 'var(--red)', fontSize: '0.75rem' }}>Passwords do not match</small>
            )}
          </div>

          {/* Permissions note */}
          <div style={{ padding: '10px 14px', background: 'rgba(124,107,255,0.08)',
            border: '1px solid rgba(124,107,255,0.2)', borderRadius: '8px',
            fontSize: '0.78rem', color: 'var(--accent2)', marginBottom: '1.2rem' }}>
            ⚡ As an Admin you will have full access to manage internships, applications, users, analytics, and all admin features.
          </div>

          <button className="btn btn-primary" type="submit" style={{ width: '100%' }}
            disabled={loading || !name || !password || password !== confirm || s < 2}>
            {loading ? 'Creating Account...' : '⚡ Create Admin Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.82rem', color: 'var(--text3)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent2)' }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
