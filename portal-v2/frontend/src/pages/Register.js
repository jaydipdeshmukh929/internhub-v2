import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import PasswordStrength, { getPasswordStrength } from '../components/PasswordStrength';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'STUDENT' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = getPasswordStrength(form.password);

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (strength.score < 3) {
      setError('Password is too weak. Please make it stronger.');
      return;
    }

    setLoading(true);
    try {
      const res = await register(form);
      if (res.data.success) {
        navigate('/verify-otp', { state: { email: form.email } });
      } else {
        setError(res.data.message);
      }
    } catch {
      setError('Server error. Is the backend running?');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">⚡ InternHub</div>
        <p className="auth-subtitle">Create your free account and start applying</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" type="text"
              value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              required placeholder="Rahul Sharma" />
          </div>

          <div className="form-group">
            <label>Email address</label>
            <input className="form-control" type="email"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
              required placeholder="you@example.com" />
          </div>

          {/* Password with show/hide toggle */}
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                className="form-control"
                type={showPassword ? 'text' : 'password'}
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                required
                placeholder="Create a strong password"
                style={{ paddingRight: '44px' }}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: 'var(--text3)',
                  fontSize: '1rem', padding: '2px',
                }}>
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            {/* Password strength checker */}
            <PasswordStrength password={form.password} />
          </div>

          <div className="form-group">
            <label>I am a</label>
            <select className="form-control" value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}>
              <option value="STUDENT">Student</option>
              <option value="ADMIN">Admin / Recruiter</option>
            </select>
          </div>

          <button className="btn btn-primary" type="submit"
            disabled={loading || strength.score < 3}
            style={{ width: '100%', marginTop: '0.5rem', opacity: strength.score < 3 && form.password ? 0.6 : 1 }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          {form.password && strength.score < 3 && (
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text3)', marginTop: '8px' }}>
              Strengthen your password to continue
            </p>
          )}
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.2rem', fontSize: '0.88rem', color: 'var(--text2)' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent2)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
