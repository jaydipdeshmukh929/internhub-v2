import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getAnnouncements, getAllAnnouncements, postAnnouncement, deleteAnnouncement, pinAnnouncement } from '../services/api';
import { useAuth } from '../context/AuthContext';

const TYPE_CONFIG = {
  INFO:    { color: 'var(--blue)',    bg: 'rgba(59,130,246,0.08)',    border: 'rgba(59,130,246,0.25)',    icon: 'ℹ️' },
  SUCCESS: { color: 'var(--green)',   bg: 'rgba(34,197,94,0.08)',     border: 'rgba(34,197,94,0.25)',     icon: '✅' },
  WARNING: { color: 'var(--amber)',   bg: 'rgba(245,158,11,0.08)',    border: 'rgba(245,158,11,0.25)',    icon: '⚠️' },
  URGENT:  { color: 'var(--red)',     bg: 'rgba(239,68,68,0.08)',     border: 'rgba(239,68,68,0.25)',     icon: '🚨' },
};

export default function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [showForm, setShowForm]           = useState(false);
  const [msg, setMsg]                     = useState('');
  const [form, setForm] = useState({ title: '', content: '', type: 'INFO', pinned: false });

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const fn = user.role === 'ADMIN' ? getAllAnnouncements : getAnnouncements;
      const r = await fn();
      setAnnouncements(r.data);
    } catch {}
  };

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      const r = await postAnnouncement({ ...form, postedByName: user.name });
      if (r.data.success) { setMsg('Announcement posted!'); setShowForm(false); setForm({ title:'', content:'', type:'INFO', pinned:false }); load(); }
    } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this announcement?')) return;
    await deleteAnnouncement(id);
    load();
  };

  const handlePin = async (id) => {
    await pinAnnouncement(id);
    load();
  };

  const timeAgo = (dt) => {
    const diff = Date.now() - new Date(dt).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'just now';
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <>
      <Navbar />
      <div className="page" style={{ maxWidth: '780px' }}>
        <div className="page-header">
          <h1 className="page-title">📢 Announcements</h1>
          {user.role === 'ADMIN' && (
            <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
              {showForm ? 'Cancel' : '+ New Announcement'}
            </button>
          )}
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}

        {/* Post form (admin only) */}
        {showForm && user.role === 'ADMIN' && (
          <form onSubmit={handlePost} className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>New Announcement</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.78rem' }}>Title</label>
                <input className="form-control" placeholder="Announcement title" required
                  value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label style={{ fontSize: '0.78rem' }}>Type</label>
                <select className="form-control" value={form.type}
                  onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {['INFO','SUCCESS','WARNING','URGENT'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>
            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label style={{ fontSize: '0.78rem' }}>Content</label>
              <textarea className="form-control" rows={3} placeholder="Announcement content..." required
                value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} />
            </div>
            <label style={{ display: 'flex', gap: '8px', alignItems: 'center', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text2)', marginBottom: '1rem' }}>
              <input type="checkbox" checked={form.pinned} onChange={e => setForm(f => ({ ...f, pinned: e.target.checked }))} />
              📌 Pin this announcement to the top
            </label>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="submit" className="btn btn-primary btn-sm">Post Announcement</button>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        )}

        {/* Announcements list */}
        {announcements.length === 0 ? (
          <div className="empty-state card">
            <div className="icon">📢</div>
            <p>No announcements yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {announcements.map(a => {
              const cfg = TYPE_CONFIG[a.type] || TYPE_CONFIG.INFO;
              return (
                <div key={a.id} style={{
                  padding: '1.2rem 1.4rem', borderRadius: 'var(--radius)',
                  background: cfg.bg, border: `1px solid ${cfg.border}`,
                  borderLeft: `4px solid ${cfg.color}`,
                  position: 'relative',
                }}>
                  {a.pinned && (
                    <span style={{ position: 'absolute', top: '10px', right: user.role === 'ADMIN' ? '80px' : '12px',
                      fontSize: '0.72rem', color: 'var(--amber)', background: 'rgba(245,158,11,0.1)',
                      padding: '2px 8px', borderRadius: '10px', border: '1px solid rgba(245,158,11,0.3)' }}>
                      📌 Pinned
                    </span>
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', paddingRight: user.role === 'ADMIN' ? '100px' : '0' }}>
                    <span style={{ fontSize: '1.3rem', flexShrink: 0 }}>{cfg.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.98rem', color: cfg.color, marginBottom: '4px' }}>
                        {a.title}
                      </div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--text2)', lineHeight: '1.6', margin: 0, whiteSpace: 'pre-wrap' }}>
                        {a.content}
                      </p>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '8px' }}>
                        Posted by {a.postedByName || 'Admin'} · {timeAgo(a.postedAt)}
                      </div>
                    </div>
                  </div>
                  {user.role === 'ADMIN' && (
                    <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', gap: '6px' }}>
                      <button className="btn btn-outline btn-xs" onClick={() => handlePin(a.id)}>
                        {a.pinned ? 'Unpin' : '📌 Pin'}
                      </button>
                      <button className="btn btn-danger btn-xs" onClick={() => handleDelete(a.id)}>Remove</button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
