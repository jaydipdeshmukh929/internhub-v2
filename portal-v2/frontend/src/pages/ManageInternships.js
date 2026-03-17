import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getAllInternships, addInternship, updateInternship, deleteInternship } from '../services/api';
import { useAuth } from '../context/AuthContext';

const EMPTY = {
  companyName:'', role:'', location:'', duration:'', stipend:'',
  description:'', responsibilities:'', requirements:'', skillsRequired:'',
  category:'Technology', type:'INTERNSHIP', openings:'', remote:false,
  stipendType:'MONTHLY', applyDeadline:'', status:'ACTIVE',
};

export default function ManageInternships() {
  const { user } = useAuth();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');
  const [search, setSearch] = useState('');

  useEffect(() => { load(); }, []);

  const load = async () => {
    try { const r = await getAllInternships(); setInternships(r.data); }
    catch {} finally { setLoading(false); }
  };

  const openAdd = () => { setForm(EMPTY); setEditId(null); setShowModal(true); setMsg(''); };

  const openEdit = (i) => {
    setForm({
      ...i,
      applyDeadline: i.applyDeadline ? i.applyDeadline.substring(0, 10) : '',
      stipend: i.stipend || '',
      openings: i.openings || '',
    });
    setEditId(i.id);
    setShowModal(true);
    setMsg('');
  };

  const save = async (e) => {
    e.preventDefault();

    // Sanitize date — strip corrupted characters (browser sometimes sends "42026-04-02")
    let cleanDeadline = (form.applyDeadline || '').trim();
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (cleanDeadline && !dateRegex.test(cleanDeadline)) {
      cleanDeadline = ''; // discard invalid date
    }

    const payload = {
      ...form,
      stipend: form.stipend ? Number(form.stipend) : null,
      openings: form.openings ? Number(form.openings) : null,
      applyDeadline: cleanDeadline || null,
      postedByEmail: user.email,
    };

    try {
      if (editId) await updateInternship(editId, payload);
      else await addInternship(payload);
      setMsg(editId ? 'Internship updated!' : 'Internship added successfully!');
      setMsgType('success');
      setShowModal(false);
      load();
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.response?.statusText || err.message;
      setMsg('Save failed: ' + errorMsg);
      setMsgType('error');
    }
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this internship? This cannot be undone.')) return;
    try {
      await deleteInternship(id);
      setMsg('Internship deleted.');
      setMsgType('success');
      load();
    } catch {
      setMsg('Delete failed.');
      setMsgType('error');
    }
  };

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const filtered = internships.filter(i =>
    !search ||
    i.role?.toLowerCase().includes(search.toLowerCase()) ||
    i.companyName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Manage Internships</h1>
          <div style={{ display: 'flex', gap: '10px' }}>
            <input className="form-control" placeholder="Search by role or company..." value={search}
              onChange={e => setSearch(e.target.value)} style={{ width: '220px' }} />
            <button className="btn btn-primary" onClick={openAdd}>+ Add Internship</button>
          </div>
        </div>

        {msg && <div className={`alert alert-${msgType === 'success' ? 'success' : 'error'}`}>{msg}</div>}

        {/* Stats */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { label: 'Total',  value: internships.length,                                    color: 'var(--accent2)' },
            { label: 'Active', value: internships.filter(i => i.status === 'ACTIVE').length, color: 'var(--green)'   },
            { label: 'Closed', value: internships.filter(i => i.status === 'CLOSED').length, color: 'var(--red)'     },
            { label: 'Draft',  value: internships.filter(i => i.status === 'DRAFT').length,  color: 'var(--amber)'   },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ flex: '1', minWidth: '100px', padding: '0.9rem' }}>
              <div className="num" style={{ color: s.color, fontSize: '1.6rem' }}>{s.value}</div>
              <div className="lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {loading ? <div className="skeleton" style={{ height: '300px', borderRadius: '14px' }} /> : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr><th>#</th><th>Role</th><th>Company</th><th>Location</th><th>Stipend</th><th>Deadline</th><th>Applied</th><th>Status</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map((i, idx) => (
                  <tr key={i.id}>
                    <td style={{ color: 'var(--text3)', fontSize: '0.82rem' }}>{idx + 1}</td>
                    <td style={{ fontWeight: 500 }}>{i.role}</td>
                    <td>{i.companyName}</td>
                    <td style={{ fontSize: '0.85rem' }}>{i.remote ? '🌐 Remote' : i.location}</td>
                    <td>₹{i.stipend?.toLocaleString()}/mo</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                      {i.applyDeadline ? new Date(i.applyDeadline).toLocaleDateString('en-IN') : '—'}
                    </td>
                    <td><span style={{ fontWeight: 600, color: 'var(--accent2)' }}>{i.applicationCount || 0}</span></td>
                    <td>
                      <span className={`badge ${i.status === 'ACTIVE' ? 'badge-accepted' : i.status === 'DRAFT' ? 'badge-under_review' : 'badge-rejected'}`}>
                        {i.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button className="btn btn-outline btn-xs" onClick={() => openEdit(i)}>Edit</button>
                        <button className="btn btn-danger btn-xs" onClick={() => remove(i.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text3)', padding: '2rem' }}>No internships found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" style={{ maxWidth: '660px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editId ? 'Edit Internship' : 'Add New Internship'}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>x</button>
            </div>
            <form onSubmit={save}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {[
                  ['companyName', 'Company Name',      'text',   'Google'],
                  ['role',        'Role / Position',   'text',   'Frontend Developer Intern'],
                  ['location',    'Location',          'text',   'Bangalore / Remote'],
                  ['duration',    'Duration',          'text',   '2 months'],
                  ['stipend',     'Stipend (Rs/month)','number', '15000'],
                  ['openings',    'No. of Openings',   'number', '5'],
                ].map(([k, l, t, p]) => (
                  <div className="form-group" key={k} style={{ margin: 0 }}>
                    <label style={{ fontSize: '0.78rem' }}>{l}</label>
                    <input className="form-control" type={t} placeholder={p}
                      value={form[k]} onChange={e => set(k, e.target.value)}
                      required={['companyName','role'].includes(k)} style={{ padding: '8px 10px' }} />
                  </div>
                ))}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', margin: '0.75rem 0' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.78rem' }}>Category</label>
                  <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)} style={{ padding: '8px 10px' }}>
                    {['Technology','Marketing','Design','Finance','Operations','HR','Sales','Legal'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.78rem' }}>Type</label>
                  <select className="form-control" value={form.type} onChange={e => set('type', e.target.value)} style={{ padding: '8px 10px' }}>
                    <option value="INTERNSHIP">Internship</option>
                    <option value="FULL_TIME">Full Time</option>
                    <option value="PART_TIME">Part Time</option>
                  </select>
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.78rem' }}>Status</label>
                  <select className="form-control" value={form.status} onChange={e => set('status', e.target.value)} style={{ padding: '8px 10px' }}>
                    <option value="ACTIVE">Active</option>
                    <option value="CLOSED">Closed</option>
                    <option value="DRAFT">Draft</option>
                  </select>
                </div>
              </div>

              {/* TEXT input instead of date picker to prevent browser corruption */}
              <div className="form-group">
                <label style={{ fontSize: '0.78rem' }}>
                  Apply Deadline <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(type as YYYY-MM-DD, e.g. 2025-06-30)</span>
                </label>
                <input className="form-control" type="text" placeholder="2025-06-30" maxLength={10}
                  value={form.applyDeadline}
                  onChange={e => set('applyDeadline', e.target.value.replace(/[^0-9-]/g, ''))}
                  style={{ padding: '8px 10px' }} />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.78rem' }}>Skills Required (comma-separated)</label>
                <input className="form-control" placeholder="React, Node.js, SQL"
                  value={form.skillsRequired} onChange={e => set('skillsRequired', e.target.value)} style={{ padding: '8px 10px' }} />
              </div>

              <div className="form-group">
                <label style={{ fontSize: '0.78rem' }}>Description</label>
                <textarea className="form-control" rows={3} placeholder="Brief about the internship..."
                  value={form.description} onChange={e => set('description', e.target.value)} style={{ padding: '8px 10px' }} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.78rem' }}>Responsibilities</label>
                  <textarea className="form-control" rows={3} value={form.responsibilities}
                    onChange={e => set('responsibilities', e.target.value)} style={{ padding: '8px 10px' }} />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '0.78rem' }}>Requirements</label>
                  <textarea className="form-control" rows={3} value={form.requirements}
                    onChange={e => set('requirements', e.target.value)} style={{ padding: '8px 10px' }} />
                </div>
              </div>

              <label style={{ display: 'flex', gap: '8px', alignItems: 'center', color: 'var(--text2)', fontSize: '0.85rem', cursor: 'pointer', margin: '0.75rem 0' }}>
                <input type="checkbox" checked={form.remote} onChange={e => set('remote', e.target.checked)} />
                This is a remote position
              </label>

              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editId ? 'Save Changes' : 'Add Internship'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}