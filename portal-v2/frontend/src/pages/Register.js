import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../services/api';
import PasswordStrength, { getPasswordStrength } from '../components/PasswordStrength';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm]           = useState({ name:'', email:'', password:'', role:'STUDENT' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]         = useState('');
  const [loading, setLoading]     = useState(false);

  const strength = getPasswordStrength(form.password);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }
    if (strength.score < 3)       { setError('Password is too weak. Please make it stronger.'); return; }

    setLoading(true);
    try {
      const res = await register(form);
      if (res.data.success) navigate('/verify-otp', { state: { email: form.email } });
      else setError(res.data.message);
    } catch { setError('Server error. Is the backend running?'); }
    finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <Link to="/home" className="auth-logo" style={{ display:'block', textAlign:'center', marginBottom:'0.5rem' }}>
          ⚡ InternHub
        </Link>
        <h2 style={{ textAlign:'center', marginBottom:'6px' }}>Create your account</h2>
        <p className="auth-subtitle" style={{ textAlign:'center', marginBottom:'1.5rem' }}>
          Join thousands of students finding internships
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={submit}>
          <div className="form-group">
            <label>Full Name</label>
            <input className="form-control" type="text" placeholder="Rahul Sharma"
              value={form.name} onChange={e => setForm({...form, name:e.target.value})} required />
          </div>

          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control" type="email" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email:e.target.value})} required />
          </div>

          <div className="form-group">
            <label>Password</label>
            <div style={{ position:'relative' }}>
              <input className="form-control"
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
                value={form.password}
                onChange={e => setForm({...form, password:e.target.value})}
                required style={{ paddingRight:'44px' }} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
                  background:'none', border:'none', cursor:'pointer', color:'var(--text3)', fontSize:'1rem' }}>
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
            <PasswordStrength password={form.password} />
          </div>

          {/* Role is always STUDENT — hidden */}
          <input type="hidden" value="STUDENT" />

          <button className="btn btn-primary" type="submit"
            disabled={loading || strength.score < 3}
            style={{ width:'100%', marginTop:'0.5rem', opacity: strength.score < 3 && form.password ? 0.6 : 1 }}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

          {form.password && strength.score < 3 && (
            <p style={{ textAlign:'center', fontSize:'0.78rem', color:'var(--text3)', marginTop:'8px' }}>
              Strengthen your password to continue
            </p>
          )}
        </form>

        <p style={{ textAlign:'center', marginTop:'1.2rem', fontSize:'0.88rem', color:'var(--text2)' }}>
          Already have an account? <Link to="/login" style={{ color:'var(--accent2)' }}>Sign in</Link>
        </p>

        <p style={{ textAlign:'center', marginTop:'0.75rem', fontSize:'0.78rem', color:'var(--text3)' }}>
          Admin? Use your <Link to="/login" style={{ color:'var(--text3)', textDecoration:'underline' }}>invite link</Link> to register.
        </p>
      </div>
    </div>
  );
}