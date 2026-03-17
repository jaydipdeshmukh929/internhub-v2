import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getAllApplications, updateAppStatus, scheduleInterview } from '../services/api';

const STATUSES = ['ALL','APPLIED','UNDER_REVIEW','SHORTLISTED','INTERVIEW_SCHEDULED','ACCEPTED','REJECTED'];
const STATUS_COLOR = {
  APPLIED:'badge-applied', UNDER_REVIEW:'badge-under_review',
  SHORTLISTED:'badge-shortlisted', INTERVIEW_SCHEDULED:'badge-interview_scheduled',
  ACCEPTED:'badge-accepted', REJECTED:'badge-rejected', WITHDRAWN:'badge-withdrawn',
};

export default function AdminApplications() {
  const [apps, setApps] = useState([]);
  const [tab, setTab] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);
  const [showInterview, setShowInterview] = useState(false);
  const [showNote, setShowNote] = useState(false);
  const [interview, setInterview] = useState({ dateTime: '', link: '', type: 'ONLINE' });
  const [note, setNote] = useState('');
  const [newStatus, setNewStatus] = useState('');
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const r = await getAllApplications(); setApps(r.data); }
    catch {} finally { setLoading(false); }
  };

  const handleStatus = async (id, status, adminNote = '') => {
    try {
      await updateAppStatus(id, { status, adminNote });
      setMsg(`Status updated to ${status}`);
      setShowNote(false);
      load();
    } catch { setMsg('Update failed'); }
  };

  const handleInterview = async () => {
    try {
      await scheduleInterview(selectedApp.id, interview);
      setMsg('Interview scheduled and email sent!');
      setShowInterview(false);
      load();
    } catch { setMsg('Failed'); }
  };

  const filtered = apps.filter(a => {
    const matchTab = tab === 'ALL' || a.status === tab;
    const matchSearch = !search || a.studentName?.toLowerCase().includes(search.toLowerCase()) ||
      a.companyName?.toLowerCase().includes(search.toLowerCase()) ||
      a.role?.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Applications</h1>
          <input className="form-control" placeholder="Search by name, company, role…"
            value={search} onChange={e => setSearch(e.target.value)} style={{ width: '260px' }} />
        </div>
        {msg && <div className="alert alert-success">{msg}</div>}

        <div className="tabs" style={{ overflowX: 'auto' }}>
          {STATUSES.map(s => (
            <button key={s} className={`tab-btn ${tab === s ? 'active' : ''}`} onClick={() => setTab(s)}>
              {s.replace('_',' ')}
              <span style={{ marginLeft: '5px', background: 'var(--surface2)', padding: '1px 6px', borderRadius: '10px', fontSize: '0.75rem' }}>
                {s === 'ALL' ? apps.length : apps.filter(a => a.status === s).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? <div className="skeleton" style={{ height: '300px', borderRadius: '14px' }} /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Student</th><th>Role</th><th>Company</th><th>Applied</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map((app, i) => (
                  <tr key={app.id}>
                    <td style={{ color: 'var(--text3)' }}>{i + 1}</td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{app.studentName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>{app.studentEmail}</div>
                    </td>
                    <td>{app.role}</td>
                    <td>{app.companyName}</td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                      {new Date(app.appliedAt).toLocaleDateString()}
                    </td>
                    <td><span className={`badge ${STATUS_COLOR[app.status]||'badge-applied'}`}>{app.status?.replace('_',' ')}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {app.status === 'APPLIED' && (
                          <button className="btn btn-outline btn-xs"
                            onClick={() => handleStatus(app.id, 'UNDER_REVIEW')}>Review</button>
                        )}
                        {['APPLIED','UNDER_REVIEW'].includes(app.status) && (
                          <button className="btn btn-outline btn-xs"
                            onClick={() => handleStatus(app.id, 'SHORTLISTED')}>Shortlist</button>
                        )}
                        {['UNDER_REVIEW','SHORTLISTED'].includes(app.status) && (
                          <button className="btn btn-outline btn-xs"
                            onClick={() => { setSelectedApp(app); setShowInterview(true); }}>
                            📅 Interview
                          </button>
                        )}
                        {!['ACCEPTED','REJECTED','WITHDRAWN'].includes(app.status) && (
                          <>
                            <button className="btn btn-success btn-xs"
                              onClick={() => { setSelectedApp(app); setNewStatus('ACCEPTED'); setNote(''); setShowNote(true); }}>
                              ✓ Accept
                            </button>
                            <button className="btn btn-danger btn-xs"
                              onClick={() => { setSelectedApp(app); setNewStatus('REJECTED'); setNote(''); setShowNote(true); }}>
                              ✗ Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--text3)', padding: '2rem' }}>No applications found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Interview Modal */}
      {showInterview && (
        <div className="modal-overlay" onClick={() => setShowInterview(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Schedule Interview</h3>
              <button className="modal-close" onClick={() => setShowInterview(false)}>×</button>
            </div>
            <p style={{ color: 'var(--text2)', fontSize: '0.88rem', marginBottom: '1rem' }}>
              For <strong>{selectedApp?.studentName}</strong> — {selectedApp?.role}
            </p>
            <div className="form-group">
              <label>Date & Time</label>
              <input className="form-control" type="datetime-local"
                value={interview.dateTime} onChange={e => setInterview({ ...interview, dateTime: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Meeting Link (optional)</label>
              <input className="form-control" placeholder="https://meet.google.com/..."
                value={interview.link} onChange={e => setInterview({ ...interview, link: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Interview Mode</label>
              <select className="form-control" value={interview.type}
                onChange={e => setInterview({ ...interview, type: e.target.value })}>
                <option value="ONLINE">Online</option>
                <option value="OFFLINE">In-Person</option>
              </select>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowInterview(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleInterview}>Schedule & Notify</button>
            </div>
          </div>
        </div>
      )}

      {/* Note Modal */}
      {showNote && (
        <div className="modal-overlay" onClick={() => setShowNote(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{newStatus === 'ACCEPTED' ? '✓ Accept' : '✗ Reject'} Application</h3>
              <button className="modal-close" onClick={() => setShowNote(false)}>×</button>
            </div>
            <p style={{ color: 'var(--text2)', fontSize: '0.88rem', marginBottom: '1rem' }}>
              <strong>{selectedApp?.studentName}</strong> — {selectedApp?.role} at {selectedApp?.companyName}
            </p>
            <div className="form-group">
              <label>Note to student (optional)</label>
              <textarea className="form-control" rows={3}
                placeholder="Add a personal note that will be emailed to the student…"
                value={note} onChange={e => setNote(e.target.value)} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowNote(false)}>Cancel</button>
              <button className={`btn ${newStatus === 'ACCEPTED' ? 'btn-success' : 'btn-danger'}`}
                onClick={() => handleStatus(selectedApp.id, newStatus, note)}>
                Confirm & Notify Student
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
