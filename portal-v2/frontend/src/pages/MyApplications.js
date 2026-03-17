import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getMyApplications, withdrawApplication } from '../services/api';
import { useAuth } from '../context/AuthContext';

const STATUS_STEPS = ['APPLIED','UNDER_REVIEW','SHORTLISTED','INTERVIEW_SCHEDULED','ACCEPTED'];
const STATUS_COLOR = {
  APPLIED:'badge-applied', UNDER_REVIEW:'badge-under_review',
  SHORTLISTED:'badge-shortlisted', INTERVIEW_SCHEDULED:'badge-interview_scheduled',
  ACCEPTED:'badge-accepted', REJECTED:'badge-rejected', WITHDRAWN:'badge-withdrawn',
};

export default function MyApplications() {
  const { user } = useAuth();
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('ALL');
  const [msg, setMsg] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const r = await getMyApplications(user.email);
      setApps(r.data);
    } catch {}
    finally { setLoading(false); }
  };

  const withdraw = async (id) => {
    if (!window.confirm('Withdraw this application?')) return;
    try {
      await withdrawApplication(id, { email: user.email });
      setMsg('Application withdrawn.');
      load();
    } catch {}
  };

  const TABS = ['ALL','APPLIED','UNDER_REVIEW','SHORTLISTED','INTERVIEW_SCHEDULED','ACCEPTED','REJECTED'];
  const filtered = tab === 'ALL' ? apps : apps.filter(a => a.status === tab);

  const stepIndex = (status) => STATUS_STEPS.indexOf(status);

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">My Applications</h1>
          <span style={{ color: 'var(--text2)', fontSize: '0.88rem' }}>{apps.length} total</span>
        </div>
        {msg && <div className="alert alert-success">{msg}</div>}

        {/* Status tabs */}
        <div className="tabs" style={{ overflowX: 'auto' }}>
          {TABS.map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>
              {t.replace('_', ' ')}
              <span style={{ marginLeft: '6px', background: 'var(--surface2)', padding: '1px 6px', borderRadius: '10px', fontSize: '0.75rem' }}>
                {t === 'ALL' ? apps.length : apps.filter(a => a.status === t).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div>{[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: '130px', borderRadius: '14px', marginBottom: '1rem' }} />)}</div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📋</div>
            <p>No applications in this category.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filtered.map(app => (
              <div key={app.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <h3 style={{ fontSize: '1.05rem' }}>{app.role}</h3>
                      <span className={`badge ${STATUS_COLOR[app.status] || 'badge-applied'}`}>
                        {app.status?.replace('_', ' ')}
                      </span>
                    </div>
                    <div style={{ color: 'var(--accent2)', fontSize: '0.88rem', fontWeight: '500', marginBottom: '8px' }}>
                      {app.companyName}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>
                      Applied {new Date(app.appliedAt).toLocaleDateString()}
                    </div>

                    {/* Interview details */}
                    {app.status === 'INTERVIEW_SCHEDULED' && app.interviewScheduledAt && (
                      <div style={{ marginTop: '10px', background: 'rgba(124,107,255,0.08)', border: '1px solid rgba(124,107,255,0.2)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.85rem' }}>
                        <div style={{ fontWeight: '600', color: 'var(--accent2)', marginBottom: '4px' }}>📅 Interview Scheduled</div>
                        <div style={{ color: 'var(--text2)' }}>
                          {new Date(app.interviewScheduledAt).toLocaleString()} • {app.interviewType}
                        </div>
                        {app.interviewLink && (
                          <a href={app.interviewLink} target="_blank" rel="noreferrer"
                            style={{ color: 'var(--accent2)', fontSize: '0.82rem' }}>
                            🔗 Join Interview
                          </a>
                        )}
                      </div>
                    )}

                    {/* Admin note */}
                    {app.adminNote && (
                      <div style={{ marginTop: '8px', fontSize: '0.82rem', color: 'var(--text2)', fontStyle: 'italic' }}>
                        💬 "{app.adminNote}"
                      </div>
                    )}
                  </div>

                  {/* Progress bar */}
                  {!['REJECTED','WITHDRAWN'].includes(app.status) && (
                    <div style={{ minWidth: '200px' }}>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginBottom: '6px' }}>Progress</div>
                      <div style={{ display: 'flex', gap: '3px' }}>
                        {STATUS_STEPS.map((s, i) => (
                          <div key={s} style={{
                            flex: 1, height: '6px', borderRadius: '3px',
                            background: i <= stepIndex(app.status) ? 'var(--accent)' : 'var(--surface2)',
                            transition: 'background 0.3s',
                          }} />
                        ))}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text3)', marginTop: '4px' }}>
                        Step {Math.max(0, stepIndex(app.status)) + 1} of {STATUS_STEPS.length}
                      </div>
                    </div>
                  )}
                </div>

                {app.status === 'APPLIED' && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid var(--border)' }}>
                    <button className="btn btn-danger btn-xs" onClick={() => withdraw(app.id)}>
                      Withdraw Application
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
