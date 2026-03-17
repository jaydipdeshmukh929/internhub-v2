import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { toggle2FA, getLoginHistory, requestDeletion, cancelDeletion, getUserByEmail } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SecuritySettings() {
  const { user } = useAuth();
  const [profile, setProfile]   = useState(null);
  const [history, setHistory]   = useState([]);
  const [msg, setMsg]           = useState('');
  const [msgType, setMsgType]   = useState('success');
  const [loading, setLoading]   = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const [p, h] = await Promise.all([getUserByEmail(user.email), getLoginHistory()]);
      setProfile(p.data);
      try {
        const raw = h.data.history;
        if (raw && raw !== '[]') {
          const parsed = JSON.parse(raw);
          setHistory(Array.isArray(parsed) ? parsed : []);
        }
      } catch {}
    } catch {}
  };

  const showMsg = (text, type = 'success') => {
    setMsg(text); setMsgType(type);
    setTimeout(() => setMsg(''), 4000);
  };

  const handle2FA = async () => {
    setLoading(true);
    try {
      const r = await toggle2FA();
      showMsg(r.data.message);
      load();
    } catch { showMsg('Failed', 'error'); }
    finally { setLoading(false); }
  };

  const handleDeletion = async () => {
    setLoading(true);
    try {
      const r = await requestDeletion();
      showMsg(r.data.message);
      setConfirmDelete(false);
      load();
    } catch { showMsg('Failed', 'error'); }
    finally { setLoading(false); }
  };

  const handleCancelDeletion = async () => {
    setLoading(true);
    try {
      const r = await cancelDeletion();
      showMsg(r.data.message);
      load();
    } catch {}
    finally { setLoading(false); }
  };

  const formatTime = (t) => {
    try { return new Date(t).toLocaleString('en-IN', { day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }); }
    catch { return t; }
  };

  return (
    <>
      <Navbar />
      <div className="page" style={{ maxWidth:'680px' }}>
        <h1 className="page-title">🔒 Security Settings</h1>
        {msg && <div className={`alert alert-${msgType}`}>{msg}</div>}

        {/* Two-Factor Authentication */}
        <div className="card" style={{ marginBottom:'1rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem' }}>
            <div>
              <h3 style={{ fontSize:'1rem', marginBottom:'6px', display:'flex', alignItems:'center', gap:'8px' }}>
                🔐 Two-Factor Authentication (2FA)
                {profile?.twoFactorEnabled
                  ? <span style={{ fontSize:'0.72rem', padding:'2px 8px', borderRadius:'10px', background:'rgba(34,197,94,0.1)', color:'var(--green)', fontWeight:600 }}>ENABLED</span>
                  : <span style={{ fontSize:'0.72rem', padding:'2px 8px', borderRadius:'10px', background:'var(--surface2)', color:'var(--text3)' }}>DISABLED</span>
                }
              </h3>
              <p style={{ fontSize:'0.83rem', color:'var(--text2)', lineHeight:'1.6' }}>
                When enabled, every login will require a 6-digit code sent to your email in addition to your password. This protects your account even if your password is compromised.
              </p>
            </div>
            <button className={`btn ${profile?.twoFactorEnabled ? 'btn-outline' : 'btn-primary'}`}
              onClick={handle2FA} disabled={loading} style={{ flexShrink:0 }}>
              {loading ? '...' : profile?.twoFactorEnabled ? 'Disable 2FA' : 'Enable 2FA'}
            </button>
          </div>
        </div>

        {/* Remember Me info */}
        <div className="card" style={{ marginBottom:'1rem' }}>
          <h3 style={{ fontSize:'1rem', marginBottom:'6px' }}>⏱ Session Duration</h3>
          <p style={{ fontSize:'0.83rem', color:'var(--text2)', lineHeight:'1.6' }}>
            On the login page, check <strong>Remember Me</strong> to stay logged in for <strong>30 days</strong>. Without it, your session lasts 24 hours.
          </p>
          <div style={{ display:'flex', gap:'1rem', marginTop:'10px' }}>
            <div style={{ padding:'8px 14px', background:'var(--surface2)', borderRadius:'8px', fontSize:'0.8rem', color:'var(--text2)', textAlign:'center' }}>
              <div style={{ fontWeight:700, color:'var(--accent2)' }}>24h</div>
              <div style={{ fontSize:'0.72rem' }}>Default</div>
            </div>
            <div style={{ padding:'8px 14px', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:'8px', fontSize:'0.8rem', color:'var(--text2)', textAlign:'center' }}>
              <div style={{ fontWeight:700, color:'var(--green)' }}>30 days</div>
              <div style={{ fontSize:'0.72rem' }}>Remember Me</div>
            </div>
          </div>
        </div>

        {/* Login History */}
        <div className="card" style={{ marginBottom:'1rem' }}>
          <h3 style={{ fontSize:'1rem', marginBottom:'1rem' }}>📋 Login History</h3>
          {history.length === 0 ? (
            <p style={{ fontSize:'0.83rem', color:'var(--text3)' }}>No login history yet.</p>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {history.map((h, i) => (
                <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 12px', background:'var(--surface2)', borderRadius:'8px' }}>
                  <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
                    <span style={{ fontSize:'1.2rem' }}>
                      {h.device?.toLowerCase().includes('mobile') ? '📱'
                        : h.device?.toLowerCase().includes('mac') ? '💻'
                        : '🖥'}
                    </span>
                    <div>
                      <div style={{ fontSize:'0.85rem', fontWeight:500 }}>{h.device || 'Unknown Device'}</div>
                      <div style={{ fontSize:'0.74rem', color:'var(--text3)' }}>{formatTime(h.time)}</div>
                    </div>
                  </div>
                  {i === 0 && <span style={{ fontSize:'0.72rem', padding:'2px 8px', borderRadius:'10px', background:'rgba(34,197,94,0.1)', color:'var(--green)', fontWeight:600 }}>Current</span>}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Account Deletion */}
        <div className="card" style={{ border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.03)' }}>
          <h3 style={{ fontSize:'1rem', marginBottom:'6px', color:'var(--red)' }}>⚠️ Account Deletion</h3>
          {profile?.deletionRequested ? (
            <>
              <div className="alert alert-error" style={{ marginBottom:'1rem' }}>
                Your account deletion is scheduled. It will be permanently deleted within 7 days.
              </div>
              <button className="btn btn-outline" onClick={handleCancelDeletion} disabled={loading}>
                Cancel Deletion Request
              </button>
            </>
          ) : (
            <>
              <p style={{ fontSize:'0.83rem', color:'var(--text2)', marginBottom:'1rem', lineHeight:'1.6' }}>
                Permanently delete your account and all associated data. This action will be completed within 7 days and cannot be undone.
              </p>
              {!confirmDelete ? (
                <button className="btn btn-outline" style={{ borderColor:'var(--red)', color:'var(--red)' }}
                  onClick={() => setConfirmDelete(true)}>
                  Request Account Deletion
                </button>
              ) : (
                <div style={{ padding:'1rem', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'8px' }}>
                  <p style={{ fontSize:'0.85rem', color:'var(--red)', fontWeight:600, marginBottom:'10px' }}>
                    Are you sure? This will delete all your applications, badges, and profile data.
                  </p>
                  <div style={{ display:'flex', gap:'10px' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setConfirmDelete(false)}>Cancel</button>
                    <button className="btn btn-sm" style={{ background:'var(--red)', color:'white', border:'none' }}
                      onClick={handleDeletion} disabled={loading}>
                      Yes, Delete My Account
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
