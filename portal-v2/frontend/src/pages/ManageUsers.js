import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getAllUsers, banUser } from '../services/api';

export default function ManageUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const r = await getAllUsers(); setUsers(r.data); }
    catch {} finally { setLoading(false); }
  };

  const toggleBan = async (u) => {
    const action = u.banned ? 'Unban' : 'Ban';
    if (!window.confirm(`${action} ${u.name}?`)) return;
    try {
      await banUser(u.id, { banned: !u.banned });
      setMsg(`${u.name} ${u.banned ? 'unbanned' : 'banned'} successfully.`);
      load();
      // Update selected user if open
      if (selectedUser?.id === u.id) {
        setSelectedUser(prev => ({ ...prev, banned: !prev.banned }));
      }
    } catch { setMsg('Action failed.'); }
  };

  const filtered = users.filter(u => {
    const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase()) ||
      u.college?.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const completionColor = (n) => {
    if (n >= 80) return 'var(--green)';
    if (n >= 50) return 'var(--amber)';
    return 'var(--red)';
  };

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) || '??';

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Manage Users</h1>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input className="form-control" placeholder="Search name, email, college…"
              value={search} onChange={e => setSearch(e.target.value)} style={{ width: '240px' }} />
            <select className="form-control" value={roleFilter}
              onChange={e => setRoleFilter(e.target.value)} style={{ width: '130px' }}>
              <option value="ALL">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total Users',  value: users.length,                                    color: 'var(--accent2)' },
            { label: 'Students',     value: users.filter(u => u.role === 'STUDENT').length,  color: 'var(--blue)'    },
            { label: 'Admins',       value: users.filter(u => u.role === 'ADMIN').length,    color: 'var(--green)'   },
            { label: 'Verified',     value: users.filter(u => u.verified).length,            color: 'var(--green)'   },
            { label: 'Banned',       value: users.filter(u => u.banned).length,              color: 'var(--red)'     },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ flex: '1', minWidth: '110px', padding: '0.9rem' }}>
              <div className="num" style={{ color: s.color, fontSize: '1.5rem' }}>{s.value}</div>
              <div className="lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? (
          <div className="skeleton" style={{ height: '300px', borderRadius: '14px' }} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 380px' : '1fr', gap: '1.5rem', alignItems: 'start' }}>

            {/* Users Table */}
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>College</th>
                    <th>Profile</th>
                    <th>Joined</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={u.id}
                      style={{ cursor: 'pointer', background: selectedUser?.id === u.id ? 'var(--surface2)' : '' }}
                      onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}>
                      <td style={{ color: 'var(--text3)', fontSize: '0.82rem' }}>{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{
                            width: '36px', height: '36px', borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '0.78rem', fontWeight: '700', color: 'white', flexShrink: 0
                          }}>
                            {initials(u.name)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{u.name}</div>
                            <div style={{ fontSize: '0.76rem', color: 'var(--text3)' }}>{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${u.role === 'ADMIN' ? 'badge-shortlisted' : 'badge-applied'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.83rem', color: 'var(--text2)' }}>{u.college || '—'}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <div style={{ width: '60px', height: '5px', background: 'var(--surface2)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ height: '100%', background: completionColor(u.profileCompletion || 0), width: `${u.profileCompletion || 0}%`, transition: 'width 0.3s' }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>{u.profileCompletion || 0}%</span>
                        </div>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-IN') : '—'}
                      </td>
                      <td>
                        {u.banned
                          ? <span className="badge badge-rejected">Banned</span>
                          : u.verified
                            ? <span className="badge badge-accepted">Active</span>
                            : <span className="badge badge-under_review">Unverified</span>
                        }
                      </td>
                      <td onClick={e => e.stopPropagation()}>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button className="btn btn-outline btn-xs"
                            onClick={() => setSelectedUser(selectedUser?.id === u.id ? null : u)}>
                            {selectedUser?.id === u.id ? 'Close' : 'View'}
                          </button>
                          <button className={`btn btn-xs ${u.banned ? 'btn-success' : 'btn-danger'}`}
                            onClick={() => toggleBan(u)}>
                            {u.banned ? 'Unban' : 'Ban'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', color: 'var(--text3)', padding: '2rem' }}>
                        No users found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* User Profile Panel */}
            {selectedUser && (
              <div className="card" style={{ position: 'sticky', top: '80px' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
                  <h3 style={{ fontSize: '1rem' }}>User Profile</h3>
                  <button onClick={() => setSelectedUser(null)}
                    style={{ background: 'none', border: 'none', color: 'var(--text2)', cursor: 'pointer', fontSize: '1.1rem' }}>
                    ×
                  </button>
                </div>

                {/* Avatar + Name */}
                <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                  <div style={{
                    width: '72px', height: '72px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1.5rem', fontWeight: '700', color: 'white',
                    margin: '0 auto 10px'
                  }}>
                    {initials(selectedUser.name)}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '1.05rem', fontFamily: 'Syne, sans-serif' }}>{selectedUser.name}</div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text2)', marginTop: '2px' }}>{selectedUser.email}</div>
                  <div style={{ display: 'flex', gap: '6px', justifyContent: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
                    <span className={`badge ${selectedUser.role === 'ADMIN' ? 'badge-shortlisted' : 'badge-applied'}`}>
                      {selectedUser.role}
                    </span>
                    {selectedUser.banned
                      ? <span className="badge badge-rejected">Banned</span>
                      : selectedUser.verified
                        ? <span className="badge badge-accepted">Verified</span>
                        : <span className="badge badge-under_review">Unverified</span>
                    }
                  </div>
                </div>

                {/* Profile Completion */}
                <div style={{ marginBottom: '1.2rem', padding: '12px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text2)' }}>Profile Completion</span>
                    <span style={{ fontSize: '0.78rem', fontWeight: 600, color: completionColor(selectedUser.profileCompletion || 0) }}>
                      {selectedUser.profileCompletion || 0}%
                    </span>
                  </div>
                  <div style={{ background: 'var(--border)', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${selectedUser.profileCompletion || 0}%`,
                      background: completionColor(selectedUser.profileCompletion || 0),
                      borderRadius: '4px',
                      transition: 'width 0.5s'
                    }} />
                  </div>
                </div>

                {/* Info Grid */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.2rem' }}>
                  {[
                    { icon: '🎓', label: 'College',    value: selectedUser.college },
                    { icon: '📚', label: 'Degree',     value: selectedUser.degree },
                    { icon: '📅', label: 'Grad Year',  value: selectedUser.graduationYear },
                    { icon: '📞', label: 'Phone',      value: selectedUser.phone },
                    { icon: '📍', label: 'Joined',     value: selectedUser.createdAt ? new Date(selectedUser.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : null },
                  ].filter(f => f.value).map(f => (
                    <div key={f.label} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span style={{ fontSize: '1rem', flexShrink: 0 }}>{f.icon}</span>
                      <div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginBottom: '1px' }}>{f.label}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text)' }}>{f.value}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Bio */}
                {selectedUser.bio && (
                  <div style={{ marginBottom: '1.2rem', padding: '10px 12px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', borderLeft: '3px solid var(--accent)' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginBottom: '4px' }}>BIO</div>
                    <p style={{ fontSize: '0.83rem', color: 'var(--text2)', lineHeight: '1.6', margin: 0 }}>{selectedUser.bio}</p>
                  </div>
                )}

                {/* Skills */}
                {selectedUser.skills && (
                  <div style={{ marginBottom: '1.2rem' }}>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginBottom: '6px' }}>SKILLS</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {selectedUser.skills.split(',').map((s, i) => s.trim() && (
                        <span key={i} className="tag" style={{ fontSize: '0.75rem', padding: '2px 8px' }}>{s.trim()}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Social Links */}
                {(selectedUser.linkedinUrl || selectedUser.githubUrl) && (
                  <div style={{ marginBottom: '1.2rem', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {selectedUser.linkedinUrl && (
                      <a href={selectedUser.linkedinUrl} target="_blank" rel="noreferrer"
                        className="btn btn-outline btn-xs" style={{ textDecoration: 'none' }}>
                        💼 LinkedIn
                      </a>
                    )}
                    {selectedUser.githubUrl && (
                      <a href={selectedUser.githubUrl} target="_blank" rel="noreferrer"
                        className="btn btn-outline btn-xs" style={{ textDecoration: 'none' }}>
                        🐙 GitHub
                      </a>
                    )}
                  </div>
                )}

                {/* Resume */}
                {selectedUser.resumePath && (
                  <div style={{ marginBottom: '1.2rem', padding: '10px 12px', background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 'var(--radius-sm)', fontSize: '0.83rem', color: 'var(--green)' }}>
                    📄 Resume uploaded
                  </div>
                )}

                {/* Ban / Unban Button */}
                <button
                  className={`btn ${selectedUser.banned ? 'btn-success' : 'btn-danger'}`}
                  style={{ width: '100%' }}
                  onClick={() => toggleBan(selectedUser)}>
                  {selectedUser.banned ? '✓ Unban This User' : '🚫 Ban This User'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}