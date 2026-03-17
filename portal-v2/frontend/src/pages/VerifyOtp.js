import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { verifyOtp, forgotPassword, resetPassword } from '../services/api';
import PasswordStrength, { getPasswordStrength } from '../components/PasswordStrength';

export function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [email] = useState(location.state?.email || '');
  const [otp, setOtp] = useState('');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setMsg(''); setLoading(true);
    try {
      const res = await verifyOtp({ email, otp });
      if (res.data.success) {
        setMsg('Email verified! Redirecting to login…');
        setTimeout(() => navigate('/login'), 1500);
      } else setError(res.data.message);
    } catch { setError('Server error.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">⚡ InternHub</div>
        <p className="auth-subtitle">Enter the 6-digit OTP sent to</p>
        <p style={{ textAlign: 'center', fontWeight: 600, color: 'var(--accent2)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          {email}
        </p>

        {msg && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>OTP Code</label>
            <input className="form-control" value={otp}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              required placeholder="123456" maxLength={6}
              style={{ letterSpacing: '8px', fontSize: '1.4rem', textAlign: 'center', fontWeight: 700 }} />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading || otp.length < 6}
            style={{ width: '100%' }}>
            {loading ? 'Verifying…' : 'Verify Email'}
          </button>
        </form>

        <div style={{
          marginTop: '1rem', padding: '10px 12px',
          background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)',
          borderRadius: 'var(--radius-sm)', fontSize: '0.78rem', color: 'var(--blue)'
        }}>
          💡 No email? Check your IntelliJ console for the OTP.
        </div>

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text2)' }}>
          <Link to="/login" style={{ color: 'var(--accent2)' }}>← Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(newPassword);

  const sendOtp = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await forgotPassword({ email });
      if (res.data.success) { setMsg(res.data.message); setStep(2); }
      else setError(res.data.message);
    } catch { setError('Server error.'); }
    finally { setLoading(false); }
  };

  const reset = async (e) => {
    e.preventDefault(); setError('');
    if (strength.score < 3) { setError('Password is too weak. Please make it stronger.'); return; }
    setLoading(true);
    try {
      const res = await resetPassword({ email, otp, newPassword });
      if (res.data.success) {
        setMsg('Password reset! Redirecting to login…');
        setTimeout(() => navigate('/login'), 1500);
      } else setError(res.data.message);
    } catch { setError('Server error.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">⚡ InternHub</div>
        <p className="auth-subtitle">
          {step === 1 ? 'Reset your password' : 'Enter OTP and set new password'}
        </p>

        {/* Steps indicator */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '1.5rem' }}>
          {['Enter Email', 'Reset Password'].map((s, i) => (
            <div key={s} style={{ flex: 1, textAlign: 'center' }}>
              <div style={{
                height: '3px', borderRadius: '2px', marginBottom: '6px',
                background: i < step ? 'var(--accent)' : 'var(--surface2)',
                transition: 'background 0.3s',
              }} />
              <span style={{ fontSize: '0.72rem', color: i < step ? 'var(--accent2)' : 'var(--text3)' }}>{s}</span>
            </div>
          ))}
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {step === 1 ? (
          <form onSubmit={sendOtp}>
            <div className="form-group">
              <label>Email address</label>
              <input className="form-control" type="email" value={email}
                onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" />
            </div>
            <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Sending OTP…' : 'Send Reset OTP'}
            </button>
          </form>
        ) : (
          <form onSubmit={reset}>
            <div className="form-group">
              <label>OTP Code</label>
              <input className="form-control"
                value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required maxLength={6} placeholder="123456"
                style={{ letterSpacing: '8px', fontSize: '1.3rem', textAlign: 'center', fontWeight: 700 }} />
            </div>

            <div className="form-group">
              <label>New Password</label>
              <div style={{ position: 'relative' }}>
                <input className="form-control"
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  required placeholder="Create a strong password"
                  style={{ paddingRight: '44px' }} />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute', right: '12px', top: '50%',
                    transform: 'translateY(-50%)', background: 'none',
                    border: 'none', cursor: 'pointer', color: 'var(--text3)', fontSize: '1rem',
                  }}>
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              <PasswordStrength password={newPassword} />
            </div>

            <div style={{
              padding: '10px 12px', background: 'rgba(59,130,246,0.08)',
              border: '1px solid rgba(59,130,246,0.2)', borderRadius: 'var(--radius-sm)',
              fontSize: '0.78rem', color: 'var(--blue)', marginBottom: '1rem',
            }}>
              💡 No email? Check your IntelliJ console for the OTP.
            </div>

            <button className="btn btn-primary" type="submit"
              disabled={loading || strength.score < 3}
              style={{ width: '100%', opacity: strength.score < 3 && newPassword ? 0.6 : 1 }}>
              {loading ? 'Resetting…' : 'Reset Password'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text2)' }}>
          <Link to="/login" style={{ color: 'var(--accent2)' }}>← Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export default VerifyOtp;
