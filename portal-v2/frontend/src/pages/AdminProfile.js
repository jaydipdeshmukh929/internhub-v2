import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getUserByEmail, updateProfile, uploadPhoto } from '../services/api';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const changePassword  = d      => API.put('/users/change-password', d);
const deleteAccount   = d      => API.delete('/users/delete-account', { data: d });
const sendInvite      = d      => API.post('/admin-invite/send', d);
const getAllInvites    = ()     => API.get('/admin-invite/all');
const revokeInvite    = id     => API.delete(`/admin-invite/revoke/${id}`);

export default function AdminProfile() {
  const { user, signIn, signOut } = useAuth();
  const [profile, setProfile]     = useState(null);
  const [tab, setTab]             = useState('info');
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(false);
  const [msg, setMsg]             = useState('');
  const [msgType, setMsgType]     = useState('success');
  const [photoFile, setPhotoFile] = useState(null);

  const [form, setForm] = useState({ name:'', phone:'', bio:'', linkedinUrl:'', githubUrl:'' });
  const [pwdForm, setPwdForm] = useState({ currentPassword:'', newPassword:'', confirmPassword:'' });
  const [showPwd, setShowPwd] = useState({ current:false, new:false, confirm:false });
  const [deletePassword, setDeletePassword] = useState('');
  const [deleteStep, setDeleteStep]         = useState(0);

  // Invite state
  const [inviteEmail, setInviteEmail]   = useState('');
  const [invites, setInvites]           = useState([]);
  const [inviteLink, setInviteLink]     = useState('');

  useEffect(() => { load(); }, []);
  useEffect(() => { if (tab === 'invite') loadInvites(); }, [tab]);

  const load = async () => {
    try {
      const r = await getUserByEmail(user.email);
      setProfile(r.data);
      setForm({ name: r.data.name||'', phone: r.data.phone||'', bio: r.data.bio||'', linkedinUrl: r.data.linkedinUrl||'', githubUrl: r.data.githubUrl||'' });
    } catch {}
    finally { setLoading(false); }
  };

  const loadInvites = async () => {
    try { const r = await getAllInvites(); setInvites(r.data); } catch {}
  };

  const showMsg = (text, type='success') => {
    setMsg(text); setMsgType(type); setTimeout(() => setMsg(''), 4000);
  };

  const handleSaveInfo = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const r = await updateProfile({ ...form, email: user.email });
      if (r.data.success) { showMsg('Profile updated!'); signIn({ ...user, name: form.name }); load(); }
      else showMsg('Update failed', 'error');
    } catch { showMsg('Update failed', 'error'); }
    finally { setSaving(false); }
  };

  const handlePhotoUpload = async (e) => {
    e.preventDefault();
    if (!photoFile) return;
    setSaving(true);
    try {
      const r = await uploadPhoto(user.email, photoFile);
      if (r.data.success) { showMsg('Photo updated!'); load(); }
    } catch { showMsg('Upload failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) { showMsg('Passwords do not match', 'error'); return; }
    if (pwdForm.newPassword.length < 6) { showMsg('Min 6 characters', 'error'); return; }
    setSaving(true);
    try {
      const r = await changePassword({ currentPassword: pwdForm.currentPassword, newPassword: pwdForm.newPassword });
      if (r.data.success) { showMsg('Password changed!'); setPwdForm({ currentPassword:'', newPassword:'', confirmPassword:'' }); }
      else showMsg(r.data.message || 'Failed', 'error');
    } catch { showMsg('Failed', 'error'); }
    finally { setSaving(false); }
  };

  const handleSendInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail) return;
    setSaving(true);
    try {
      const r = await sendInvite({ email: inviteEmail, inviterName: user.name });
      if (r.data.success) {
        showMsg(r.data.message);
        setInviteLink(r.data.link);
        setInviteEmail('');
        loadInvites();
      } else showMsg(r.data.message, 'error');
    } catch { showMsg('Failed to send invite', 'error'); }
    finally { setSaving(false); }
  };

  const handleRevokeInvite = async (id) => {
    if (!window.confirm('Revoke this invitation?')) return;
    try { await revokeInvite(id); loadInvites(); showMsg('Invite revoked'); } catch {}
  };

  const handleDeleteAccount = async () => {
    if (!deletePassword) { showMsg('Enter password to confirm', 'error'); return; }
    setSaving(true);
    try {
      const r = await deleteAccount({ password: deletePassword });
      if (r.data.success) { signOut(); window.location.href = '/login'; }
      else showMsg(r.data.message || 'Incorrect password', 'error');
    } catch { showMsg('Deletion failed', 'error'); }
    finally { setSaving(false); }
  };

  const pwdStrength = (p) => {
    let s = 0;
    if (p.length >= 6) s++; if (p.length >= 10) s++;
    if (/[A-Z]/.test(p)) s++; if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const sLabel = ['','Weak','Fair','Good','Strong','Very Strong'];
  const sColor = ['','#ef4444','#f59e0b','#3b82f6','#22c55e','#7c6bff'];
  const s = pwdStrength(pwdForm.newPassword);

  const timeAgo = (dt) => {
    const diff = Date.now() - new Date(dt).getTime();
    const h = Math.floor(diff / 3600000);
    if (h < 1) return 'just now';
    if (h < 24) return h + 'h ago';
    return Math.floor(h/24) + 'd ago';
  };

  if (loading) return <><Navbar /><div className="page"><div className="skeleton" style={{ height:'300px', borderRadius:'14px' }} /></div></>;

  return (
    <>
      <Navbar />
      <div className="page" style={{ maxWidth:'720px' }}>
        <h1 className="page-title">Admin Profile</h1>
        {msg && <div className={`alert alert-${msgType}`}>{msg}</div>}

        {/* Header card */}
        <div className="card" style={{ marginBottom:'1.5rem', display:'flex', gap:'1.5rem', alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ width:'80px', height:'80px', borderRadius:'50%', flexShrink:0, background:'linear-gradient(135deg,var(--accent),var(--accent2))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', color:'white', fontWeight:700 }}>
            {profile?.name?.charAt(0)?.toUpperCase() || 'A'}
          </div>
          <div style={{ flex:1 }}>
            <h2 style={{ fontSize:'1.3rem', marginBottom:'4px' }}>{profile?.name}</h2>
            <div style={{ color:'var(--text2)', fontSize:'0.88rem', marginBottom:'6px' }}>{profile?.email}</div>
            <span style={{ display:'inline-block', padding:'3px 12px', borderRadius:'12px', background:'rgba(124,107,255,0.15)', color:'var(--accent2)', fontSize:'0.75rem', fontWeight:700 }}>⚡ ADMIN</span>
          </div>
          <div style={{ fontSize:'0.8rem', color:'var(--text3)', textAlign:'right' }}>
            Joined {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-IN',{ day:'numeric', month:'short', year:'numeric' }) : '—'}
          </div>
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom:'1.5rem', flexWrap:'wrap' }}>
          {[
            ['info',     '👤 Info'          ],
            ['photo',    '📷 Photo'         ],
            ['password', '🔑 Password'      ],
            ['invite',   '📨 Invite Admin'  ],
            ['danger',   '⚠️ Delete Account'],
          ].map(([k, v]) => (
            <button key={k} className={`tab-btn ${tab===k?'active':''}`}
              onClick={() => setTab(k)}
              style={k==='danger' ? { color: tab==='danger' ? 'white' : 'var(--red)' } : {}}>
              {v}
            </button>
          ))}
        </div>

        {/* ── Info ─────────────────────────────────────── */}
        {tab === 'info' && (
          <form onSubmit={handleSaveInfo} className="card">
            <h3 style={{ marginBottom:'1.2rem', fontSize:'1rem' }}>Update Your Information</h3>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div className="form-group">
                <label>Full Name</label>
                <input className="form-control" value={form.name} onChange={e => setForm(f=>({...f,name:e.target.value}))} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input className="form-control" value={user.email} disabled style={{ opacity:0.6 }} />
              </div>
              <div className="form-group">
                <label>Phone</label>
                <input className="form-control" placeholder="+91 9876543210" value={form.phone} onChange={e => setForm(f=>({...f,phone:e.target.value}))} />
              </div>
              <div className="form-group">
                <label>LinkedIn URL</label>
                <input className="form-control" type="url" placeholder="https://linkedin.com/in/..." value={form.linkedinUrl} onChange={e => setForm(f=>({...f,linkedinUrl:e.target.value}))} />
              </div>
              <div className="form-group" style={{ gridColumn:'1 / -1' }}>
                <label>GitHub URL</label>
                <input className="form-control" type="url" placeholder="https://github.com/..." value={form.githubUrl} onChange={e => setForm(f=>({...f,githubUrl:e.target.value}))} />
              </div>
              <div className="form-group" style={{ gridColumn:'1 / -1' }}>
                <label>Bio</label>
                <textarea className="form-control" rows={3} placeholder="Tell students about you..." value={form.bio} onChange={e => setForm(f=>({...f,bio:e.target.value}))} />
              </div>
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving} style={{ marginTop:'0.5rem', width:'auto', padding:'10px 28px' }}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        )}

        {/* ── Photo ─────────────────────────────────────── */}
        {tab === 'photo' && (
          <form onSubmit={handlePhotoUpload} className="card">
            <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Update Profile Photo</h3>
            <div className="form-group">
              <label>Select JPG, PNG or WEBP (max 10 MB)</label>
              <input type="file" className="form-control" accept=".jpg,.jpeg,.png,.webp" onChange={e => setPhotoFile(e.target.files[0])} />
            </div>
            <button className="btn btn-primary" type="submit" disabled={saving || !photoFile} style={{ width:'auto', padding:'10px 24px' }}>
              {saving ? 'Uploading...' : 'Upload Photo'}
            </button>
          </form>
        )}

        {/* ── Password ──────────────────────────────────── */}
        {tab === 'password' && (
          <form onSubmit={handleChangePassword} className="card">
            <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Change Password</h3>
            {[
              ['currentPassword','Current Password','Enter current password','current'],
              ['newPassword','New Password','Min 6 characters','new'],
              ['confirmPassword','Confirm New Password','Re-enter new password','confirm'],
            ].map(([key, label, ph, eye]) => (
              <div className="form-group" key={key}>
                <label>{label}</label>
                <div style={{ position:'relative' }}>
                  <input className="form-control" type={showPwd[eye] ? 'text' : 'password'}
                    placeholder={ph} value={pwdForm[key]}
                    onChange={e => setPwdForm(f=>({...f,[key]:e.target.value}))} required
                    style={{ paddingRight:'44px',
                      borderColor: key==='confirmPassword' && pwdForm.confirmPassword && pwdForm.confirmPassword !== pwdForm.newPassword ? 'var(--red)' : '' }} />
                  <button type="button" onClick={() => setShowPwd(p=>({...p,[eye]:!p[eye]}))}
                    style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', fontSize:'1rem', color:'var(--text3)' }}>
                    {showPwd[eye] ? '🙈' : '👁'}
                  </button>
                </div>
                {key === 'newPassword' && pwdForm.newPassword && (
                  <div style={{ marginTop:'8px' }}>
                    <div style={{ display:'flex', gap:'4px', marginBottom:'4px' }}>
                      {[1,2,3,4,5].map(i => <div key={i} style={{ flex:1, height:'4px', borderRadius:'2px', background: i<=s ? sColor[s] : 'var(--surface2)', transition:'background 0.3s' }} />)}
                    </div>
                    <span style={{ fontSize:'0.75rem', color:sColor[s], fontWeight:600 }}>{sLabel[s]}</span>
                  </div>
                )}
                {key === 'confirmPassword' && pwdForm.confirmPassword && pwdForm.confirmPassword !== pwdForm.newPassword && (
                  <small style={{ color:'var(--red)', fontSize:'0.75rem' }}>Passwords do not match</small>
                )}
              </div>
            ))}
            <button className="btn btn-primary" type="submit" style={{ width:'auto', padding:'10px 28px' }}
              disabled={saving || !pwdForm.currentPassword || !pwdForm.newPassword || pwdForm.newPassword !== pwdForm.confirmPassword}>
              {saving ? 'Changing...' : '🔑 Change Password'}
            </button>
          </form>
        )}

        {/* ── Invite Admin ──────────────────────────────── */}
        {tab === 'invite' && (
          <div>
            <div className="card" style={{ marginBottom:'1rem' }}>
              <h3 style={{ marginBottom:'0.5rem', fontSize:'1rem' }}>📨 Invite New Admin</h3>
              <p style={{ fontSize:'0.83rem', color:'var(--text2)', marginBottom:'1.2rem', lineHeight:'1.6' }}>
                Send an invitation link to someone you want to add as an admin. They will receive an email with a secure link to create their admin account. The link expires in 48 hours.
              </p>

              <form onSubmit={handleSendInvite} style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
                <input className="form-control" type="email" placeholder="Enter email address to invite..."
                  value={inviteEmail} onChange={e => setInviteEmail(e.target.value)} required
                  style={{ flex:1, minWidth:'240px' }} />
                <button className="btn btn-primary" type="submit" disabled={saving || !inviteEmail}>
                  {saving ? 'Sending...' : '📨 Send Invite'}
                </button>
              </form>

              {/* Show generated link */}
              {inviteLink && (
                <div style={{ marginTop:'1rem', padding:'12px 14px', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:'8px' }}>
                  <div style={{ fontSize:'0.78rem', color:'var(--green)', fontWeight:600, marginBottom:'6px' }}>✅ Invite sent! Link also generated below (for testing):</div>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                    <code style={{ flex:1, fontSize:'0.72rem', color:'var(--text2)', background:'var(--surface2)', padding:'6px 10px', borderRadius:'6px', wordBreak:'break-all' }}>
                      {inviteLink}
                    </code>
                    <button className="btn btn-outline btn-sm" onClick={() => { navigator.clipboard.writeText(inviteLink); showMsg('Link copied!'); }}>
                      Copy
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Flow diagram */}
            <div className="card" style={{ marginBottom:'1rem' }}>
              <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>How the Invite Flow Works</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {[
                  ['1', 'You enter email and click Send Invite',            '👤'],
                  ['2', 'System generates a unique 48-hour secure token',   '🔑'],
                  ['3', 'Invite email sent + link printed to console',       '📧'],
                  ['4', 'New admin opens link → sees registration form',     '🌐'],
                  ['5', 'They enter name and set password',                  '✍️'],
                  ['6', 'Account created → auto-logged in as Admin',         '⚡'],
                  ['7', 'Now multiple admins can manage InternHub together', '🏆'],
                ].map(([n, txt, icon]) => (
                  <div key={n} style={{ display:'flex', gap:'12px', alignItems:'center', padding:'8px 12px', background:'var(--surface2)', borderRadius:'8px' }}>
                    <div style={{ width:'26px', height:'26px', borderRadius:'50%', background:'var(--accent)', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:700, flexShrink:0 }}>{n}</div>
                    <span style={{ fontSize:'1rem' }}>{icon}</span>
                    <span style={{ fontSize:'0.85rem', color:'var(--text2)' }}>{txt}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Invites list */}
            <div className="card">
              <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>All Invitations ({invites.length})</h3>
              {invites.length === 0 ? (
                <div className="empty-state" style={{ padding:'1.5rem 0' }}>
                  <div className="icon">📨</div>
                  <p>No invitations sent yet.</p>
                </div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {invites.map(inv => (
                    <div key={inv.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'var(--surface2)', borderRadius:'8px', flexWrap:'wrap', gap:'8px' }}>
                      <div>
                        <div style={{ fontWeight:600, fontSize:'0.88rem' }}>{inv.invitedEmail}</div>
                        <div style={{ fontSize:'0.75rem', color:'var(--text3)', marginTop:'2px' }}>
                          Sent by {inv.invitedByName} · {timeAgo(inv.createdAt)}
                        </div>
                      </div>
                      <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                        <span style={{ fontSize:'0.72rem', padding:'3px 10px', borderRadius:'10px', fontWeight:600,
                          background: inv.used ? 'rgba(34,197,94,0.1)' : new Date(inv.expiresAt) < new Date() ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                          color: inv.used ? 'var(--green)' : new Date(inv.expiresAt) < new Date() ? 'var(--red)' : 'var(--amber)' }}>
                          {inv.used ? '✅ Used' : new Date(inv.expiresAt) < new Date() ? '⏰ Expired' : '⏳ Pending'}
                        </span>
                        {!inv.used && new Date(inv.expiresAt) > new Date() && (
                          <button className="btn btn-outline btn-xs" onClick={() => handleRevokeInvite(inv.id)}
                            style={{ color:'var(--red)', borderColor:'rgba(239,68,68,0.3)', fontSize:'0.72rem', padding:'3px 8px' }}>
                            Revoke
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Delete Account ────────────────────────────── */}
        {tab === 'danger' && (
          <div>
            <div className="card" style={{ border:'1px solid rgba(239,68,68,0.3)', background:'rgba(239,68,68,0.03)' }}>
              <h3 style={{ color:'var(--red)', marginBottom:'0.75rem', fontSize:'1rem' }}>⚠️ Delete Admin Account</h3>
              <p style={{ color:'var(--text2)', fontSize:'0.88rem', lineHeight:'1.7', marginBottom:'1rem' }}>
                This permanently removes your admin account. All your data will be deleted immediately.
              </p>
              <div style={{ display:'flex', flexDirection:'column', gap:'6px', marginBottom:'1.2rem' }}>
                {['Account permanently deleted','Admin access revoked immediately','Internships and configs remain untouched','Cannot be undone'].map((w,i) => (
                  <div key={i} style={{ display:'flex', gap:'8px', fontSize:'0.85rem', color:'var(--text2)' }}>
                    <span style={{ color:'var(--red)' }}>✗</span> {w}
                  </div>
                ))}
              </div>

              {deleteStep === 0 && (
                <button className="btn" onClick={() => setDeleteStep(1)}
                  style={{ background:'transparent', border:'1px solid var(--red)', color:'var(--red)', padding:'8px 20px', borderRadius:'8px', cursor:'pointer' }}>
                  I want to delete my account
                </button>
              )}
              {deleteStep === 1 && (
                <div style={{ padding:'1rem', background:'rgba(239,68,68,0.08)', borderRadius:'8px', border:'1px solid rgba(239,68,68,0.2)' }}>
                  <p style={{ fontWeight:600, color:'var(--red)', marginBottom:'10px', fontSize:'0.88rem' }}>Are you absolutely sure?</p>
                  <div style={{ display:'flex', gap:'10px' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => setDeleteStep(0)}>Cancel</button>
                    <button className="btn btn-sm" onClick={() => setDeleteStep(2)}
                      style={{ background:'var(--red)', color:'white', border:'none', padding:'8px 16px', borderRadius:'8px', cursor:'pointer' }}>
                      Yes, proceed
                    </button>
                  </div>
                </div>
              )}
              {deleteStep === 2 && (
                <div style={{ padding:'1rem', background:'rgba(239,68,68,0.08)', borderRadius:'8px', border:'1px solid rgba(239,68,68,0.3)' }}>
                  <p style={{ fontWeight:600, color:'var(--red)', marginBottom:'12px', fontSize:'0.88rem' }}>Enter your password to confirm:</p>
                  <div className="form-group" style={{ marginBottom:'12px' }}>
                    <input className="form-control" type="password" placeholder="Your password"
                      value={deletePassword} onChange={e => setDeletePassword(e.target.value)}
                      style={{ borderColor:'rgba(239,68,68,0.5)' }} />
                  </div>
                  <div style={{ display:'flex', gap:'10px' }}>
                    <button className="btn btn-outline btn-sm" onClick={() => { setDeleteStep(0); setDeletePassword(''); }}>Cancel</button>
                    <button onClick={handleDeleteAccount} disabled={saving || !deletePassword}
                      style={{ background:'var(--red)', color:'white', border:'none', padding:'8px 20px', borderRadius:'8px', cursor:'pointer', opacity:(!deletePassword||saving)?0.5:1, fontWeight:600 }}>
                      {saving ? 'Deleting...' : '🗑 Delete Permanently'}
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div style={{ marginTop:'1rem', padding:'12px 16px', background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:'var(--radius-sm)', fontSize:'0.82rem', color:'var(--blue)' }}>
              💡 Instead of deleting, consider inviting another admin and stepping back from management.
            </div>
          </div>
        )}
      </div>
    </>
  );
}
