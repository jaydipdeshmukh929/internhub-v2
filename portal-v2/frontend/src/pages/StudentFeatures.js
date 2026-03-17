import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import InternshipCard from '../components/InternshipCard';
import {
  scoreResume, getRecommendations, getBadges,
  getReferralInfo, uploadCertificate, getCertificates,
  getUserByEmail, updateProfile, getSavedInternships
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { id: 'resume',       label: '📊 Resume Score'       },
  { id: 'recommend',    label: '💡 Recommendations'     },
  { id: 'portfolio',    label: '💼 Portfolio'            },
  { id: 'certificates', label: '📜 Certificates'        },
  { id: 'badges',       label: '🏆 Badges'              },
  { id: 'referral',     label: '🤝 Refer & Earn'        },
];

export default function StudentFeatures() {
  const { user } = useAuth();
  const [tab, setTab]               = useState('resume');
  const [msg, setMsg]               = useState('');
  const [msgType, setMsgType]       = useState('success');
  const [loading, setLoading]       = useState(false);

  // Resume score state
  const [resumeFile, setResumeFile] = useState(null);
  const [scoreResult, setScoreResult] = useState(null);
  const [savedScore, setSavedScore] = useState(null);

  // Recommendations state
  const [recommendations, setRecommendations] = useState([]);
  const [savedIds, setSavedIds]     = useState([]);
  const [recLoading, setRecLoading] = useState(false);

  // Portfolio state
  const [portfolio, setPortfolio]   = useState([]);
  const [newLink, setNewLink]       = useState({ title: '', url: '' });
  const [profileData, setProfileData] = useState(null);

  // Certificates state
  const [certificates, setCertificates] = useState([]);
  const [certForm, setCertForm]     = useState({ companyName: '', role: '', completionDate: '' });
  const [certFile, setCertFile]     = useState(null);

  // Badges state
  const [badges, setBadges]         = useState([]);

  // Referral state
  const [referral, setReferral]     = useState(null);
  const [copied, setCopied]         = useState(false);

  useEffect(() => {
    loadProfile();
    loadSaved();
  }, []);

  useEffect(() => {
    if (tab === 'recommend' && recommendations.length === 0) loadRecommendations();
    if (tab === 'badges')    loadBadges();
    if (tab === 'referral')  loadReferral();
    if (tab === 'certificates') loadCertificates();
  }, [tab]);

  const showMsg = (text, type = 'success') => { setMsg(text); setMsgType(type); setTimeout(() => setMsg(''), 4000); };

  const loadProfile = async () => {
    try {
      const r = await getUserByEmail(user.email);
      setProfileData(r.data);
      setSavedScore(r.data.resumeScore);
      if (r.data.portfolioLinks) {
        try { setPortfolio(JSON.parse(r.data.portfolioLinks)); }
        catch { setPortfolio([]); }
      }
    } catch {}
  };

  const loadSaved = async () => {
    try {
      const r = await getSavedInternships(user.email);
      setSavedIds(r.data.map(i => String(i.id)));
    } catch {}
  };

  const loadRecommendations = async () => {
    setRecLoading(true);
    try {
      const r = await getRecommendations(user.email);
      setRecommendations(Array.isArray(r.data) ? r.data : []);
    } catch {}
    finally { setRecLoading(false); }
  };

  const loadBadges = async () => {
    try { const r = await getBadges(user.email); setBadges(r.data); }
    catch {}
  };

  const loadReferral = async () => {
    try { const r = await getReferralInfo(user.email); setReferral(r.data); }
    catch {}
  };

  const loadCertificates = async () => {
    try { const r = await getCertificates(user.email); setCertificates(r.data); }
    catch {}
  };

  // Resume Score
  const handleScoreResume = async (e) => {
    e.preventDefault();
    if (!resumeFile) return;
    setLoading(true); setScoreResult(null);
    try {
      const r = await scoreResume(user.email, resumeFile);
      if (r.data.success) { setScoreResult(r.data); setSavedScore(r.data.score); }
      else showMsg(r.data.message, 'error');
    } catch { showMsg('Score failed. Make sure resume is a text-readable file.', 'error'); }
    finally { setLoading(false); }
  };

  // Portfolio
  const addPortfolioLink = async () => {
    if (!newLink.title || !newLink.url) return;
    const updated = [...portfolio, { ...newLink, id: Date.now() }];
    setPortfolio(updated);
    setNewLink({ title: '', url: '' });
    try {
      await updateProfile({ email: user.email, portfolioLinks: JSON.stringify(updated) });
      showMsg('Portfolio link added!');
    } catch { showMsg('Save failed', 'error'); }
  };

  const removeLink = async (id) => {
    const updated = portfolio.filter(l => l.id !== id);
    setPortfolio(updated);
    try {
      await updateProfile({ email: user.email, portfolioLinks: JSON.stringify(updated) });
      showMsg('Link removed.');
    } catch {}
  };

  // Certificate upload
  const handleCertUpload = async (e) => {
    e.preventDefault();
    if (!certFile) return;
    setLoading(true);
    const fd = new FormData();
    fd.append('email', user.email);
    fd.append('studentName', user.name);
    fd.append('companyName', certForm.companyName);
    fd.append('role', certForm.role);
    fd.append('completionDate', certForm.completionDate);
    fd.append('file', certFile);
    try {
      const r = await uploadCertificate(fd);
      if (r.data.success) {
        showMsg('Certificate uploaded! 📜 Badge earned!');
        setCertForm({ companyName: '', role: '', completionDate: '' });
        setCertFile(null);
        loadCertificates();
      } else showMsg(r.data.message, 'error');
    } catch { showMsg('Upload failed', 'error'); }
    finally { setLoading(false); }
  };

  // Referral copy
  const copyReferralLink = () => {
    if (referral?.referralLink) {
      navigator.clipboard.writeText(referral.referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const scoreColor = (s) => s >= 70 ? 'var(--green)' : s >= 50 ? 'var(--amber)' : 'var(--red)';
  const scoreGrade = (s) => s >= 85 ? '🏆 Excellent' : s >= 70 ? '✅ Good' : s >= 50 ? '⚠️ Average' : '❌ Needs Work';

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Student Features</h1>
          {profileData?.badgeCount > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px',
              background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)',
              borderRadius: '20px', padding: '6px 14px', fontSize: '0.85rem', color: 'var(--amber)' }}>
              🏅 {profileData.badgeCount} Badge{profileData.badgeCount !== 1 ? 's' : ''} Earned
            </div>
          )}
        </div>

        {msg && <div className={`alert alert-${msgType}`}>{msg}</div>}

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '8px 16px', borderRadius: '20px', border: '1px solid',
              cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500, transition: 'all 0.2s',
              background: tab === t.id ? 'var(--accent)' : 'var(--surface)',
              borderColor: tab === t.id ? 'var(--accent)' : 'var(--border)',
              color: tab === t.id ? 'white' : 'var(--text2)',
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── RESUME SCORE ────────────────────────────────── */}
        {tab === 'resume' && (
          <div style={{ display: 'grid', gridTemplateColumns: scoreResult ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ marginBottom: '0.5rem' }}>AI Resume Analyzer</h3>
              <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
                Upload your resume (PDF or TXT) and get an instant score with improvement tips.
              </p>

              {savedScore > 0 && !scoreResult && (
                <div style={{ marginBottom: '1rem', padding: '12px', background: 'var(--surface2)',
                  borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '1.8rem', fontWeight: 700, color: scoreColor(savedScore), fontFamily: 'Syne,sans-serif' }}>
                    {savedScore}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{scoreGrade(savedScore)}</div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text3)' }}>Last score — upload again to refresh</div>
                  </div>
                </div>
              )}

              <form onSubmit={handleScoreResume}>
                <div className="form-group">
                  <label>Upload Resume (PDF or plain text)</label>
                  <input type="file" className="form-control" accept=".pdf,.txt,.doc,.docx"
                    onChange={e => setResumeFile(e.target.files[0])} required />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '4px' }}>
                    💡 For best results, save your resume as a .txt file first
                  </div>
                </div>
                <button className="btn btn-primary" type="submit" disabled={loading || !resumeFile} style={{ width: '100%' }}>
                  {loading ? 'Analyzing…' : '🔍 Analyze My Resume'}
                </button>
              </form>
            </div>

            {scoreResult && (
              <div className="card">
                <div style={{ textAlign: 'center', marginBottom: '1.2rem' }}>
                  <div style={{ fontSize: '3.5rem', fontWeight: 800, color: scoreColor(scoreResult.score),
                    fontFamily: 'Syne,sans-serif', lineHeight: 1 }}>
                    {scoreResult.score}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginTop: '4px' }}>out of 100</div>
                  <div style={{ marginTop: '8px', fontSize: '1rem' }}>{scoreResult.emoji} {scoreResult.grade}</div>
                </div>

                {/* Score bar */}
                <div style={{ background: 'var(--surface2)', borderRadius: '6px', height: '10px',
                  overflow: 'hidden', marginBottom: '1.2rem' }}>
                  <div style={{ height: '100%', borderRadius: '6px', transition: 'width 1s',
                    background: `linear-gradient(90deg, ${scoreColor(scoreResult.score)}, ${scoreColor(scoreResult.score)}aa)`,
                    width: `${scoreResult.score}%` }} />
                </div>

                {/* Strengths */}
                {scoreResult.strengths?.length > 0 && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--green)', marginBottom: '6px' }}>
                      ✅ STRENGTHS ({scoreResult.strengths.length})
                    </div>
                    {scoreResult.strengths.map((s, i) => (
                      <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text2)', padding: '4px 0',
                        borderBottom: '1px solid var(--border)', display: 'flex', gap: '6px' }}>
                        <span style={{ color: 'var(--green)' }}>✓</span> {s}
                      </div>
                    ))}
                  </div>
                )}

                {/* Improvements */}
                {scoreResult.improvements?.length > 0 && (
                  <div>
                    <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--amber)', marginBottom: '6px' }}>
                      💡 IMPROVEMENTS ({scoreResult.improvements.length})
                    </div>
                    {scoreResult.improvements.map((s, i) => (
                      <div key={i} style={{ fontSize: '0.82rem', color: 'var(--text2)', padding: '4px 0',
                        borderBottom: '1px solid var(--border)', display: 'flex', gap: '6px' }}>
                        <span style={{ color: 'var(--amber)' }}>→</span> {s}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── RECOMMENDATIONS ────────────────────────────── */}
        {tab === 'recommend' && (
          <div>
            <div style={{ marginBottom: '1.2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ color: 'var(--text2)', fontSize: '0.88rem' }}>
                Based on your skills: <strong style={{ color: 'var(--accent2)' }}>
                  {profileData?.skills || 'No skills added yet'}
                </strong>
              </p>
              <button className="btn btn-outline btn-sm" onClick={loadRecommendations}>↻ Refresh</button>
            </div>

            {recLoading ? (
              <div className="grid-3">{[...Array(6)].map((_, i) =>
                <div key={i} className="skeleton" style={{ height: '200px', borderRadius: '14px' }} />
              )}</div>
            ) : recommendations.length === 0 ? (
              <div className="empty-state card">
                <div className="icon">💡</div>
                <p style={{ marginBottom: '1rem' }}>No recommendations yet.</p>
                <a href="/profile" style={{ color: 'var(--accent2)', fontSize: '0.88rem' }}>
                  → Add skills to your profile to get personalized recommendations
                </a>
              </div>
            ) : (
              <div className="grid-3">
                {recommendations.map(i => (
                  <InternshipCard key={i.id} internship={i} savedIds={savedIds}
                    onBookmarkChange={id => setSavedIds(prev =>
                      prev.includes(String(id)) ? prev.filter(x => x !== String(id)) : [...prev, String(id)]
                    )} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── PORTFOLIO ──────────────────────────────────── */}
        {tab === 'portfolio' && (
          <div style={{ maxWidth: '700px' }}>
            <div className="card" style={{ marginBottom: '1.2rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Add Project / Portfolio Link</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>Project Title</label>
                  <input className="form-control" placeholder="E-commerce App"
                    value={newLink.title} onChange={e => setNewLink({ ...newLink, title: e.target.value })} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label>URL</label>
                  <input className="form-control" placeholder="https://github.com/..."
                    value={newLink.url} onChange={e => setNewLink({ ...newLink, url: e.target.value })} />
                </div>
                <button className="btn btn-primary btn-sm" onClick={addPortfolioLink}
                  disabled={!newLink.title || !newLink.url} style={{ marginBottom: '1px' }}>
                  + Add
                </button>
              </div>
            </div>

            {portfolio.length === 0 ? (
              <div className="empty-state card">
                <div className="icon">💼</div>
                <p>No portfolio links yet. Add your GitHub projects, live demos, or Behance work.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {portfolio.map((link, i) => (
                  <div key={link.id || i} className="card" style={{ display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between', gap: '1rem', padding: '1rem 1.2rem' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '3px' }}>{link.title}</div>
                      <a href={link.url} target="_blank" rel="noreferrer"
                        style={{ fontSize: '0.82rem', color: 'var(--accent2)' }}>{link.url}</a>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a href={link.url} target="_blank" rel="noreferrer" className="btn btn-outline btn-xs">Open →</a>
                      <button className="btn btn-danger btn-xs" onClick={() => removeLink(link.id)}>Remove</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── CERTIFICATES ───────────────────────────────── */}
        {tab === 'certificates' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div className="card">
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Upload Completion Certificate</h3>
              <form onSubmit={handleCertUpload}>
                {[
                  { key: 'companyName', label: 'Company Name', ph: 'Google, Amazon...' },
                  { key: 'role',        label: 'Role',         ph: 'Frontend Developer Intern' },
                ].map(f => (
                  <div className="form-group" key={f.key}>
                    <label>{f.label}</label>
                    <input className="form-control" placeholder={f.ph} value={certForm[f.key]}
                      onChange={e => setCertForm({ ...certForm, [f.key]: e.target.value })} required />
                  </div>
                ))}
                <div className="form-group">
                  <label>Completion Date <span style={{ color: 'var(--text3)' }}>(YYYY-MM-DD)</span></label>
                  <input className="form-control" type="text" placeholder="2025-06-30"
                    value={certForm.completionDate}
                    onChange={e => setCertForm({ ...certForm, completionDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Certificate File (PDF)</label>
                  <input type="file" className="form-control" accept=".pdf,.jpg,.jpeg,.png"
                    onChange={e => setCertFile(e.target.files[0])} required />
                </div>
                <button className="btn btn-primary" type="submit" disabled={loading} style={{ width: '100%' }}>
                  {loading ? 'Uploading…' : '📤 Upload Certificate'}
                </button>
              </form>
            </div>

            <div>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>My Certificates ({certificates.length})</h3>
              {certificates.length === 0 ? (
                <div className="empty-state card">
                  <div className="icon">📜</div>
                  <p>No certificates uploaded yet.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {certificates.map(c => (
                    <div key={c.id} className="card" style={{ padding: '1rem 1.2rem' }}>
                      <div style={{ fontWeight: 600, marginBottom: '4px' }}>{c.role}</div>
                      <div style={{ color: 'var(--accent2)', fontSize: '0.85rem', marginBottom: '6px' }}>{c.companyName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
                        {c.completionDate ? `Completed: ${new Date(c.completionDate).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}` : ''}
                      </div>
                      <div style={{ marginTop: '8px', fontSize: '0.78rem', color: 'var(--green)' }}>
                        ✅ Certificate uploaded
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BADGES ─────────────────────────────────────── */}
        {tab === 'badges' && (
          <div>
            <p style={{ color: 'var(--text2)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
              Badges are earned automatically when you complete actions on InternHub.
              You have <strong style={{ color: 'var(--amber)' }}>{badges.length}</strong> badge{badges.length !== 1 ? 's' : ''}.
            </p>
            {badges.length === 0 ? (
              <div className="empty-state card">
                <div className="icon">🏆</div>
                <p>No badges yet. Start applying, complete your profile, and refer friends to earn badges!</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: '1rem' }}>
                {badges.map(b => (
                  <div key={b.id} className="card card-hover" style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                    <div style={{ fontSize: '2.5rem', marginBottom: '10px' }}>{b.badgeIcon}</div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: '6px',
                      fontFamily: 'Syne,sans-serif' }}>{b.badgeName}</div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text2)', marginBottom: '8px' }}>
                      {b.badgeDescription}
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>
                      {new Date(b.earnedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* All possible badges */}
            <div style={{ marginTop: '2rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '1rem', color: 'var(--text2)' }}>All Badges to Earn</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(180px,1fr))', gap: '8px' }}>
                {[
                  ['🎯','First Step','Submit your first application'],
                  ['🔭','Explorer','Apply to 5 internships'],
                  ['🚀','Go-Getter','Apply to 10 internships'],
                  ['⭐','Profile Pro','80% profile completion'],
                  ['📄','Resume Ready','Upload your resume'],
                  ['🏅','Resume Scorer','Get a resume score of 70+'],
                  ['🤝','Connector','Refer 1 friend'],
                  ['💎','Super Connector','Refer 5 friends'],
                  ['🎉','Accepted!','Get accepted to an internship'],
                  ['🎤','Interview Star','Get shortlisted for interview'],
                  ['📜','Certified','Upload a certificate'],
                  ['💼','Portfolio Star','Add projects to portfolio'],
                ].map(([icon, name, desc]) => {
                  const earned = badges.some(b => b.badgeName === name);
                  return (
                    <div key={name} style={{
                      padding: '10px', borderRadius: 'var(--radius-sm)',
                      border: `1px solid ${earned ? 'rgba(245,158,11,0.4)' : 'var(--border)'}`,
                      background: earned ? 'rgba(245,158,11,0.06)' : 'var(--surface)',
                      display: 'flex', gap: '8px', alignItems: 'center',
                      opacity: earned ? 1 : 0.5,
                    }}>
                      <span style={{ fontSize: '1.2rem' }}>{icon}</span>
                      <div>
                        <div style={{ fontSize: '0.8rem', fontWeight: 600, color: earned ? 'var(--amber)' : 'var(--text2)' }}>{name}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text3)' }}>{desc}</div>
                      </div>
                      {earned && <span style={{ marginLeft: 'auto', color: 'var(--amber)', fontSize: '0.8rem' }}>✓</span>}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── REFERRAL ───────────────────────────────────── */}
        {tab === 'referral' && (
          <div style={{ maxWidth: '680px' }}>
            {!referral ? (
              <div className="skeleton" style={{ height: '200px', borderRadius: '14px' }} />
            ) : (
              <>
                {/* Stats */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
                  {[
                    { label: 'Your Code',  value: referral.referralCode, color: 'var(--accent2)' },
                    { label: 'Friends Referred', value: referral.referralCount || 0, color: 'var(--green)' },
                    { label: 'Badges from Referrals', value: [1,5].filter(n => (referral.referralCount||0) >= n).length, color: 'var(--amber)' },
                  ].map(s => (
                    <div key={s.label} className="stat-card">
                      <div className="num" style={{ color: s.color, fontSize: '1.4rem' }}>{s.value}</div>
                      <div className="lbl">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Share card */}
                <div className="card" style={{ marginBottom: '1.2rem' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Your Referral Link</h3>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
                    <input className="form-control" readOnly value={referral.referralLink}
                      style={{ background: 'var(--surface2)', cursor: 'text', fontFamily: 'var(--font-mono)', fontSize: '0.82rem' }} />
                    <button className="btn btn-primary btn-sm" onClick={copyReferralLink}
                      style={{ whiteSpace: 'nowrap', minWidth: '80px' }}>
                      {copied ? '✓ Copied!' : 'Copy'}
                    </button>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>
                    Share this link with friends. When they register, you earn referral credit and unlock badges!
                  </p>
                </div>

                {/* Rewards breakdown */}
                <div className="card">
                  <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Referral Rewards</h3>
                  {[
                    { milestone: 1,  badge: '🤝 Connector',        earned: (referral.referralCount||0) >= 1  },
                    { milestone: 5,  badge: '💎 Super Connector',   earned: (referral.referralCount||0) >= 5  },
                  ].map(r => (
                    <div key={r.milestone} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '12px 0', borderBottom: '1px solid var(--border)'
                    }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Refer {r.milestone} friend{r.milestone > 1 ? 's' : ''}</div>
                        <div style={{ fontSize: '0.82rem', color: 'var(--text2)', marginTop: '2px' }}>Earn {r.badge}</div>
                      </div>
                      {r.earned
                        ? <span style={{ color: 'var(--green)', fontWeight: 700, fontSize: '0.85rem' }}>✓ Earned</span>
                        : <span style={{ color: 'var(--text3)', fontSize: '0.82rem' }}>
                            {r.milestone - (referral.referralCount||0)} more to go
                          </span>
                      }
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}