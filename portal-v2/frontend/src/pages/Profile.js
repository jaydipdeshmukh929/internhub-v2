import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import DragDropResume from '../components/DragDropResume';
import { getUserByEmail, updateProfile, uploadResume, uploadPhoto } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, signIn } = useAuth();
  const [profile, setProfile]       = useState(null);
  const [form, setForm]             = useState({});
  const [msg, setMsg]               = useState('');
  const [error, setError]           = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [photoFile, setPhotoFile]   = useState(null);
  const [loading, setLoading]       = useState(true);
  const [tab, setTab]               = useState('info');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const r = await getUserByEmail(user.email);
      setProfile(r.data);
      setForm({
        email:          r.data.email,
        name:           r.data.name           || '',
        bio:            r.data.bio            || '',
        skills:         r.data.skills         || '',
        college:        r.data.college        || '',
        degree:         r.data.degree         || '',
        graduationYear: r.data.graduationYear || '',
        phone:          r.data.phone          || '',
        linkedinUrl:    r.data.linkedinUrl    || '',
        githubUrl:      r.data.githubUrl      || '',
      });
    } catch {}
    finally { setLoading(false); }
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setMsg(''); setError('');
    try {
      const r = await updateProfile(form);
      if (r.data.success) {
        setMsg('Profile updated!');
        signIn({ ...user, name: form.name, profileCompletion: r.data.profileCompletion });
        load();
      }
    } catch { setError('Update failed.'); }
  };

  const saveResume = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;
    try {
      const r = await uploadResume(user.email, resumeFile);
      if (r.data.success) { setMsg('Resume uploaded!'); load(); }
      else setError(r.data.message);
    } catch { setError('Upload failed.'); }
  };

  const savePhoto = async (e) => {
    e.preventDefault();
    if (!photoFile) return;
    try {
      const r = await uploadPhoto(user.email, photoFile);
      if (r.data.success) { setMsg('Photo uploaded!'); load(); }
      else setError(r.data.message);
    } catch { setError('Upload failed.'); }
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="page">
        <div className="skeleton" style={{ height: '400px', borderRadius: '14px' }} />
      </div>
    </>
  );

  const completion = profile?.profileCompletion || 0;
  const completionColor = completion >= 80 ? 'var(--green)' : completion >= 50 ? 'var(--amber)' : 'var(--red)';

  return (
    <>
      <Navbar />
      <div className="page" style={{ maxWidth: '780px' }}>
        {msg   && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Profile header card */}
        <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '2rem', color: 'white', fontWeight: 700, flexShrink: 0,
          }}>
            {profile?.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '4px' }}>{profile?.name}</h2>
            <div style={{ color: 'var(--text2)', fontSize: '0.88rem', marginBottom: '10px' }}>{profile?.email}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ background: 'var(--surface2)', borderRadius: '10px', height: '8px', flex: 1, maxWidth: '220px', overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: '10px', background: completionColor, width: `${completion}%`, transition: 'width 0.5s' }} />
              </div>
              <span style={{ fontSize: '0.82rem', color: completionColor, fontWeight: 600 }}>
                {completion}% complete
              </span>
            </div>
          </div>
          {profile?.points > 0 && (
            <div style={{ textAlign: 'center', padding: '10px 16px', background: 'rgba(124,107,255,0.1)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(124,107,255,0.3)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--accent2)' }}>{profile.points}</div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>Points</div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="tabs">
          {[
            ['info',   'Personal Info'],
            ['skills', 'Skills & Links'],
            ['resume', 'Resume & Photo'],
          ].map(([k, v]) => (
            <button key={k} className={`tab-btn ${tab === k ? 'active' : ''}`} onClick={() => setTab(k)}>
              {v}
            </button>
          ))}
        </div>

        {/* Personal Info tab */}
        {tab === 'info' && (
          <form onSubmit={saveProfile} className="card">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {[
                { key: 'name',           label: 'Full Name',           type: 'text',   ph: 'Rahul Sharma'   },
                { key: 'phone',          label: 'Phone',               type: 'text',   ph: '+91 9876543210' },
                { key: 'college',        label: 'College / University', type: 'text',   ph: 'IIT Bombay'     },
                { key: 'degree',         label: 'Degree',              type: 'text',   ph: 'B.Tech CSE'     },
                { key: 'graduationYear', label: 'Graduation Year',     type: 'number', ph: '2026'           },
              ].map(f => (
                <div className="form-group" key={f.key}>
                  <label>{f.label}</label>
                  <input className="form-control" type={f.type} placeholder={f.ph}
                    value={form[f.key] || ''}
                    onChange={e => setForm({ ...form, [f.key]: e.target.value })} />
                </div>
              ))}
            </div>
            <div className="form-group">
              <label>Bio</label>
              <textarea className="form-control" rows={3}
                placeholder="Tell companies about yourself..."
                value={form.bio}
                onChange={e => setForm({ ...form, bio: e.target.value })} />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: 'auto', padding: '10px 28px' }}>
              Save Changes
            </button>
          </form>
        )}

        {/* Skills & Links tab */}
        {tab === 'skills' && (
          <form onSubmit={saveProfile} className="card">
            <div className="form-group">
              <label>Skills (comma-separated)</label>
              <input className="form-control" placeholder="React, Java, Python, Figma..."
                value={form.skills}
                onChange={e => setForm({ ...form, skills: e.target.value })} />
              {form.skills && (
                <div style={{ marginTop: '10px', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {form.skills.split(',').map((s, i) => s.trim() && (
                    <span key={i} className="tag">{s.trim()}</span>
                  ))}
                </div>
              )}
            </div>
            <div className="form-group">
              <label>LinkedIn URL</label>
              <input className="form-control" type="url" placeholder="https://linkedin.com/in/yourname"
                value={form.linkedinUrl}
                onChange={e => setForm({ ...form, linkedinUrl: e.target.value })} />
            </div>
            <div className="form-group">
              <label>GitHub URL</label>
              <input className="form-control" type="url" placeholder="https://github.com/yourname"
                value={form.githubUrl}
                onChange={e => setForm({ ...form, githubUrl: e.target.value })} />
            </div>
            <button className="btn btn-primary" type="submit" style={{ width: 'auto', padding: '10px 28px' }}>
              Save Changes
            </button>
          </form>
        )}

        {/* Resume & Photo tab */}
        {tab === 'resume' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Resume upload with drag & drop */}
            <form onSubmit={saveResume} className="card">
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>📄 Upload Resume</h3>
              {profile?.resumePath && (
                <div className="alert alert-info" style={{ marginBottom: '1rem' }}>
                  ✅ Resume already uploaded — drop a new file to replace it.
                </div>
              )}
              <DragDropResume onFileSelect={setResumeFile} label="Resume" />
              <button className="btn btn-primary" type="submit"
                style={{ width: 'auto', padding: '10px 24px', marginTop: '1rem' }}
                disabled={!resumeFile}>
                Upload Resume
              </button>
            </form>

            {/* Photo upload */}
            <form onSubmit={savePhoto} className="card">
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>📷 Profile Photo</h3>
              <div className="form-group">
                <label>JPG or PNG (max 10 MB)</label>
                <input type="file" className="form-control" accept=".jpg,.jpeg,.png,.webp"
                  onChange={e => setPhotoFile(e.target.files[0])} />
              </div>
              <button className="btn btn-primary" type="submit"
                style={{ width: 'auto', padding: '10px 24px' }}
                disabled={!photoFile}>
                Upload Photo
              </button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}