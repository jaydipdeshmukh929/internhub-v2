import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import {
  saveCompanyProfile, getAllCompanies,
  importExcel, importCsv,
  exportApplicationsExcel,
  getEmailTemplates, saveEmailTemplate
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { id: 'company',    label: '🏢 Company Profiles'   },
  { id: 'import',     label: '📥 Bulk Import'         },
  { id: 'export',     label: '📤 Export Applications' },
  { id: 'templates',  label: '✉️ Email Templates'     },
];

const TEMPLATE_TYPES = ['ACCEPTED','REJECTED','SHORTLISTED','INTERVIEW_SCHEDULED'];
const TEMPLATE_COLORS = {
  ACCEPTED: 'var(--green)', REJECTED: 'var(--red)',
  SHORTLISTED: 'var(--accent2)', INTERVIEW_SCHEDULED: 'var(--amber)'
};

const PLACEHOLDERS_HELP = '{studentName} · {role} · {company} · {adminNote}';

export default function AdminFeatures() {
  const { user } = useAuth();
  const [tab, setTab]       = useState('company');
  const [msg, setMsg]       = useState('');
  const [msgType, setMsgType] = useState('success');
  const [loading, setLoading] = useState(false);

  // Company profile state
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyForm, setCompanyForm] = useState({
    companyName:'', website:'', industry:'', location:'',
    foundedYear:'', companySize:'', about:'', benefits:'',
    linkedinUrl:'', twitterUrl:'', glassdoorUrl:''
  });

  // Import state
  const [importFile, setImportFile]       = useState(null);
  const [importType, setImportType]       = useState('excel');
  const [importResult, setImportResult]   = useState(null);

  // Export state
  const [exportStatus, setExportStatus]   = useState('');

  // Template state
  const [templates, setTemplates]         = useState([]);
  const [defaults, setDefaults]           = useState({});
  const [editTemplate, setEditTemplate]   = useState(null);
  const [templateForm, setTemplateForm]   = useState({ templateType:'ACCEPTED', subject:'', body:'' });

  useEffect(() => {
    if (tab === 'company')   loadCompanies();
    if (tab === 'templates') loadTemplates();
  }, [tab]);

  const showMsg = (text, type='success') => { setMsg(text); setMsgType(type); setTimeout(() => setMsg(''), 4000); };

  const loadCompanies = async () => {
    try { const r = await getAllCompanies(); setCompanies(r.data); } catch {}
  };

  const loadTemplates = async () => {
    try {
      const r = await getEmailTemplates();
      setTemplates(r.data.templates || []);
      setDefaults(r.data.defaults || {});
    } catch {}
  };

  // ── Company ──
  const handleSaveCompany = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const r = await saveCompanyProfile(companyForm);
      if (r.data.success) {
        showMsg('Company profile saved!');
        loadCompanies();
        setCompanyForm({ companyName:'', website:'', industry:'', location:'',
          foundedYear:'', companySize:'', about:'', benefits:'',
          linkedinUrl:'', twitterUrl:'', glassdoorUrl:'' });
      } else showMsg(r.data.message, 'error');
    } catch { showMsg('Save failed', 'error'); }
    finally { setLoading(false); }
  };

  const loadCompanyIntoForm = (cp) => {
    setCompanyForm({
      companyName: cp.companyName || '', website: cp.website || '',
      industry: cp.industry || '', location: cp.location || '',
      foundedYear: cp.foundedYear || '', companySize: cp.companySize || '',
      about: cp.about || '', benefits: cp.benefits || '',
      linkedinUrl: cp.linkedinUrl || '', twitterUrl: cp.twitterUrl || '',
      glassdoorUrl: cp.glassdoorUrl || '',
    });
    setSelectedCompany(cp);
  };

  // ── Import ──
  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile) return;
    setLoading(true); setImportResult(null);
    try {
      const fn = importType === 'excel' ? importExcel : importCsv;
      const r = await fn(importFile);
      setImportResult(r.data);
      if (r.data.success) showMsg(r.data.message);
      else showMsg(r.data.message, 'error');
    } catch { showMsg('Import failed', 'error'); }
    finally { setLoading(false); }
  };

  // ── Export ──
  const handleExport = async () => {
    setLoading(true);
    try {
      const r = await exportApplicationsExcel(exportStatus || null);
      const blob = new Blob([r.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `applications_${exportStatus || 'all'}_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      showMsg('Export downloaded!');
    } catch { showMsg('Export failed', 'error'); }
    finally { setLoading(false); }
  };

  // ── Templates ──
  const startEditTemplate = (type) => {
    const existing = templates.find(t => t.templateType === type);
    const def = defaults[type] || ['', ''];
    setTemplateForm({
      templateType: type,
      subject: existing?.subject || def[0] || '',
      body:    existing?.body    || def[1] || '',
    });
    setEditTemplate(type);
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const r = await saveEmailTemplate(templateForm);
      if (r.data.success) {
        showMsg('Template saved!');
        setEditTemplate(null);
        loadTemplates();
      }
    } catch { showMsg('Save failed', 'error'); }
    finally { setLoading(false); }
  };

  const setF = (k, v) => setCompanyForm(f => ({ ...f, [k]: v }));

  const industryOptions = ['Technology','Finance','Healthcare','Education','E-commerce',
    'Manufacturing','Media','Consulting','Logistics','Real Estate','Other'];
  const sizeOptions = ['1-10','11-50','51-200','201-500','501-1000','1000+'];

  return (
    <>
      <Navbar />
      <div className="page">
        <h1 className="page-title">Admin Features</h1>

        {msg && <div className={`alert alert-${msgType}`}>{msg}</div>}

        {/* Tabs */}
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'1.5rem' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:'8px 16px', borderRadius:'20px', border:'1px solid',
              cursor:'pointer', fontSize:'0.85rem', fontWeight:500, transition:'all 0.2s',
              background: tab === t.id ? 'var(--accent)' : 'var(--surface)',
              borderColor: tab === t.id ? 'var(--accent)' : 'var(--border)',
              color: tab === t.id ? 'white' : 'var(--text2)',
            }}>{t.label}</button>
          ))}
        </div>

        {/* ── COMPANY PROFILES ────────────────────────── */}
        {tab === 'company' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
            {/* Form */}
            <div className="card">
              <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>
                {selectedCompany ? `Edit – ${selectedCompany.companyName}` : 'Add Company Profile'}
              </h3>
              <form onSubmit={handleSaveCompany}>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                  {[
                    ['companyName','Company Name','text','Google','required'],
                    ['website','Website','url','https://google.com',''],
                    ['location','Location','text','Bangalore',''],
                    ['foundedYear','Founded Year','text','2000',''],
                  ].map(([k,l,t,p,req]) => (
                    <div className="form-group" key={k} style={{ margin:0 }}>
                      <label style={{ fontSize:'0.78rem' }}>{l}</label>
                      <input className="form-control" type={t} placeholder={p}
                        value={companyForm[k]} onChange={e => setF(k, e.target.value)}
                        required={req === 'required'} style={{ padding:'8px 10px' }} />
                    </div>
                  ))}
                  <div className="form-group" style={{ margin:0 }}>
                    <label style={{ fontSize:'0.78rem' }}>Industry</label>
                    <select className="form-control" value={companyForm.industry}
                      onChange={e => setF('industry', e.target.value)} style={{ padding:'8px 10px' }}>
                      <option value="">Select...</option>
                      {industryOptions.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                  <div className="form-group" style={{ margin:0 }}>
                    <label style={{ fontSize:'0.78rem' }}>Company Size</label>
                    <select className="form-control" value={companyForm.companySize}
                      onChange={e => setF('companySize', e.target.value)} style={{ padding:'8px 10px' }}>
                      <option value="">Select...</option>
                      {sizeOptions.map(o => <option key={o} value={o}>{o} employees</option>)}
                    </select>
                  </div>
                </div>

                <div className="form-group" style={{ marginTop:'0.75rem' }}>
                  <label style={{ fontSize:'0.78rem' }}>About Company</label>
                  <textarea className="form-control" rows={3}
                    placeholder="Tell students about your company, mission, and culture..."
                    value={companyForm.about} onChange={e => setF('about', e.target.value)}
                    style={{ padding:'8px 10px' }} />
                </div>

                <div className="form-group">
                  <label style={{ fontSize:'0.78rem' }}>Benefits / Perks (comma-separated)</label>
                  <input className="form-control" placeholder="Free lunch, Health insurance, Remote work..."
                    value={companyForm.benefits} onChange={e => setF('benefits', e.target.value)}
                    style={{ padding:'8px 10px' }} />
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'0.75rem' }}>
                  {[
                    ['linkedinUrl','LinkedIn','https://linkedin.com/company/...'],
                    ['twitterUrl','Twitter','https://twitter.com/...'],
                    ['glassdoorUrl','Glassdoor','https://glassdoor.com/...'],
                  ].map(([k,l,p]) => (
                    <div className="form-group" key={k} style={{ margin:0 }}>
                      <label style={{ fontSize:'0.78rem' }}>{l}</label>
                      <input className="form-control" type="url" placeholder={p}
                        value={companyForm[k]} onChange={e => setF(k, e.target.value)}
                        style={{ padding:'8px 10px' }} />
                    </div>
                  ))}
                </div>

                <div style={{ display:'flex', gap:'10px', marginTop:'1rem' }}>
                  <button className="btn btn-primary" type="submit" disabled={loading} style={{ flex:1 }}>
                    {loading ? 'Saving...' : selectedCompany ? 'Update Profile' : 'Save Profile'}
                  </button>
                  {selectedCompany && (
                    <button type="button" className="btn btn-outline"
                      onClick={() => { setSelectedCompany(null); setCompanyForm({ companyName:'',website:'',industry:'',location:'',foundedYear:'',companySize:'',about:'',benefits:'',linkedinUrl:'',twitterUrl:'',glassdoorUrl:'' }); }}>
                      Clear
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Companies list */}
            <div>
              <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>All Companies ({companies.length})</h3>
              {companies.length === 0 ? (
                <div className="empty-state card"><div className="icon">🏢</div><p>No company profiles yet.</p></div>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'10px', maxHeight:'600px', overflowY:'auto' }}>
                  {companies.map(cp => (
                    <div key={cp.id} className="card card-hover" style={{ padding:'1rem 1.2rem', cursor:'pointer' }}
                      onClick={() => loadCompanyIntoForm(cp)}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                        <div>
                          <div style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:'4px' }}>{cp.companyName}</div>
                          <div style={{ fontSize:'0.8rem', color:'var(--text2)', marginBottom:'4px' }}>
                            {cp.industry} · {cp.location} · {cp.companySize && cp.companySize + ' employees'}
                          </div>
                          {cp.website && (
                            <a href={cp.website} target="_blank" rel="noreferrer"
                              onClick={e => e.stopPropagation()}
                              style={{ fontSize:'0.78rem', color:'var(--accent2)' }}>{cp.website}</a>
                          )}
                        </div>
                        <div style={{ textAlign:'right', flexShrink:0 }}>
                          {cp.averageRating > 0 && (
                            <div style={{ fontSize:'0.82rem', color:'var(--amber)' }}>
                              ★ {cp.averageRating} ({cp.totalReviews})
                            </div>
                          )}
                          <div style={{ fontSize:'0.75rem', color:'var(--text3)', marginTop:'2px' }}>
                            {cp.totalInternships} internships
                          </div>
                        </div>
                      </div>
                      {cp.benefits && (
                        <div style={{ marginTop:'8px', display:'flex', flexWrap:'wrap', gap:'4px' }}>
                          {cp.benefits.split(',').slice(0,3).map((b,i) => (
                            <span key={i} className="meta-chip" style={{ fontSize:'0.72rem' }}>{b.trim()}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── BULK IMPORT ──────────────────────────────── */}
        {tab === 'import' && (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
            <div className="card">
              <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Import Internships from File</h3>
              <div style={{ display:'flex', gap:'8px', marginBottom:'1.2rem' }}>
                {['excel','csv'].map(t => (
                  <button key={t} onClick={() => setImportType(t)} style={{
                    flex:1, padding:'8px', borderRadius:'8px', border:'1px solid',
                    cursor:'pointer', fontSize:'0.85rem', fontWeight:500,
                    background: importType===t ? 'var(--accent)' : 'var(--surface)',
                    borderColor: importType===t ? 'var(--accent)' : 'var(--border)',
                    color: importType===t ? 'white' : 'var(--text2)',
                  }}>
                    {t === 'excel' ? '📊 Excel (.xlsx)' : '📄 CSV (.csv)'}
                  </button>
                ))}
              </div>

              <form onSubmit={handleImport}>
                <div className="form-group">
                  <label>Select {importType === 'excel' ? 'Excel (.xlsx)' : 'CSV (.csv)'} file</label>
                  <input type="file" className="form-control"
                    accept={importType === 'excel' ? '.xlsx,.xls' : '.csv'}
                    onChange={e => { setImportFile(e.target.files[0]); setImportResult(null); }}
                    required />
                </div>
                <button className="btn btn-primary" type="submit" disabled={loading || !importFile}
                  style={{ width:'100%' }}>
                  {loading ? 'Importing...' : '📥 Import Internships'}
                </button>
              </form>

              {importResult && (
                <div style={{ marginTop:'1rem', padding:'12px', borderRadius:'var(--radius-sm)',
                  background: importResult.success ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
                  border: `1px solid ${importResult.success ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)'}` }}>
                  <div style={{ fontWeight:600, fontSize:'0.88rem',
                    color: importResult.success ? 'var(--green)' : 'var(--red)', marginBottom:'6px' }}>
                    {importResult.success ? '✅' : '❌'} {importResult.message}
                  </div>
                  {importResult.errors?.length > 0 && (
                    <div style={{ fontSize:'0.78rem', color:'var(--amber)' }}>
                      <div style={{ marginBottom:'4px' }}>⚠️ {importResult.errors.length} row(s) had errors:</div>
                      {importResult.errors.map((e, i) => <div key={i} style={{ marginLeft:'12px' }}>• {e}</div>)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Template download */}
            <div className="card">
              <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Required Column Format</h3>
              <div style={{ overflowX:'auto' }}>
                <table style={{ fontSize:'0.75rem', width:'100%' }}>
                  <thead>
                    <tr>
                      {['Col','Header','Example'].map(h => (
                        <th key={h} style={{ background:'var(--surface2)', padding:'6px 8px',
                          textAlign:'left', fontSize:'0.72rem' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['A','companyName','Google'],
                      ['B','role','Frontend Developer Intern'],
                      ['C','location','Bangalore'],
                      ['D','duration','2 months'],
                      ['E','stipend','15000'],
                      ['F','category','Technology'],
                      ['G','skillsRequired','React, Node.js'],
                      ['H','description','Brief about role'],
                      ['I','openings','5'],
                      ['J','remote','false'],
                      ['K','applyDeadline','2025-06-30'],
                    ].map(([col, head, ex]) => (
                      <tr key={col}>
                        <td style={{ padding:'5px 8px', fontWeight:600, color:'var(--accent2)' }}>{col}</td>
                        <td style={{ padding:'5px 8px', fontFamily:'var(--font-mono)', fontSize:'0.72rem' }}>{head}</td>
                        <td style={{ padding:'5px 8px', color:'var(--text3)' }}>{ex}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div style={{ marginTop:'12px', padding:'10px', background:'rgba(59,130,246,0.08)',
                border:'1px solid rgba(59,130,246,0.2)', borderRadius:'var(--radius-sm)',
                fontSize:'0.78rem', color:'var(--blue)' }}>
                💡 Row 1 must be the header row. Data starts from Row 2.
              </div>
            </div>
          </div>
        )}

        {/* ── EXPORT ──────────────────────────────────── */}
        {tab === 'export' && (
          <div style={{ maxWidth:'600px' }}>
            <div className="card">
              <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Export Applications to Excel</h3>
              <p style={{ color:'var(--text2)', fontSize:'0.85rem', marginBottom:'1.2rem' }}>
                Download all application data as a formatted Excel file with a summary sheet.
              </p>

              <div className="form-group">
                <label>Filter by Status (optional)</label>
                <select className="form-control" value={exportStatus}
                  onChange={e => setExportStatus(e.target.value)}>
                  <option value="">All Applications</option>
                  {['APPLIED','UNDER_REVIEW','SHORTLISTED','INTERVIEW_SCHEDULED','ACCEPTED','REJECTED','WITHDRAWN'].map(s => (
                    <option key={s} value={s}>{s.replace('_',' ')}</option>
                  ))}
                </select>
              </div>

              <button className="btn btn-primary" onClick={handleExport} disabled={loading}
                style={{ width:'100%' }}>
                {loading ? 'Generating...' : '📥 Download Excel File'}
              </button>
            </div>

            {/* What's included */}
            <div className="card" style={{ marginTop:'1rem' }}>
              <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>What's included in the export?</h3>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
                {['Student Name','Student Email','Company','Role','Status',
                  'Cover Letter','Applied Date','Interview Date','Interview Link','Admin Notes'].map(f => (
                  <div key={f} style={{ display:'flex', gap:'6px', alignItems:'center',
                    fontSize:'0.83rem', color:'var(--text2)' }}>
                    <span style={{ color:'var(--green)' }}>✓</span> {f}
                  </div>
                ))}
              </div>
              <div style={{ marginTop:'12px', fontSize:'0.78rem', color:'var(--text3)' }}>
                + Summary sheet with totals, accepted/rejected counts, and export date.
              </div>
            </div>
          </div>
        )}

        {/* ── EMAIL TEMPLATES ──────────────────────────── */}
        {tab === 'templates' && (
          <div>
            {!editTemplate ? (
              <>
                <p style={{ color:'var(--text2)', fontSize:'0.85rem', marginBottom:'1.5rem' }}>
                  Customize the emails sent to students when their application status changes.
                  Uses placeholders: <code style={{ background:'var(--surface2)', padding:'2px 6px',
                  borderRadius:'4px', fontSize:'0.8rem' }}>{PLACEHOLDERS_HELP}</code>
                </p>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'1rem' }}>
                  {TEMPLATE_TYPES.map(type => {
                    const custom = templates.find(t => t.templateType === type);
                    const isCustomized = !!custom;
                    return (
                      <div key={type} className="card card-hover">
                        <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'10px' }}>
                          <span style={{ fontSize:'1.3rem' }}>
                            {type==='ACCEPTED'?'🎉':type==='REJECTED'?'😔':type==='SHORTLISTED'?'⭐':'📅'}
                          </span>
                          {isCustomized
                            ? <span style={{ fontSize:'0.72rem', padding:'2px 8px', borderRadius:'10px',
                                background:'rgba(34,197,94,0.1)', color:'var(--green)', fontWeight:600 }}>
                                Custom
                              </span>
                            : <span style={{ fontSize:'0.72rem', padding:'2px 8px', borderRadius:'10px',
                                background:'var(--surface2)', color:'var(--text3)' }}>Default</span>
                          }
                        </div>
                        <div style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:'4px',
                          color: TEMPLATE_COLORS[type] }}>
                          {type.replace('_',' ')}
                        </div>
                        <div style={{ fontSize:'0.78rem', color:'var(--text2)', marginBottom:'12px' }}>
                          {isCustomized
                            ? `Subject: ${custom.subject?.substring(0,40)}...`
                            : 'Using default template'}
                        </div>
                        <button className="btn btn-outline btn-sm" style={{ width:'100%' }}
                          onClick={() => startEditTemplate(type)}>
                          ✏️ {isCustomized ? 'Edit Template' : 'Customize'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div style={{ maxWidth:'700px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.2rem' }}>
                  <h3 style={{ fontSize:'1rem' }}>
                    Edit Template: <span style={{ color: TEMPLATE_COLORS[editTemplate] }}>{editTemplate.replace('_',' ')}</span>
                  </h3>
                  <button className="btn btn-outline btn-sm" onClick={() => setEditTemplate(null)}>← Back</button>
                </div>

                <div style={{ padding:'10px 14px', background:'rgba(59,130,246,0.08)',
                  border:'1px solid rgba(59,130,246,0.2)', borderRadius:'var(--radius-sm)',
                  fontSize:'0.78rem', color:'var(--blue)', marginBottom:'1.2rem' }}>
                  Available placeholders: <strong>{PLACEHOLDERS_HELP}</strong>
                </div>

                <form onSubmit={handleSaveTemplate} className="card">
                  <div className="form-group">
                    <label>Email Subject</label>
                    <input className="form-control" placeholder="Email subject line..."
                      value={templateForm.subject}
                      onChange={e => setTemplateForm(f => ({...f, subject: e.target.value}))}
                      required />
                  </div>
                  <div className="form-group">
                    <label>Email Body</label>
                    <textarea className="form-control" rows={12}
                      placeholder="Write your email body here. Use {studentName}, {role}, {company}, {adminNote} as placeholders..."
                      value={templateForm.body}
                      onChange={e => setTemplateForm(f => ({...f, body: e.target.value}))}
                      required style={{ fontFamily:'var(--font-mono)', fontSize:'0.85rem', lineHeight:'1.6' }} />
                  </div>

                  {/* Live preview */}
                  {templateForm.body && (
                    <div style={{ marginBottom:'1rem' }}>
                      <div style={{ fontSize:'0.78rem', color:'var(--text3)', marginBottom:'6px' }}>Preview:</div>
                      <div style={{ background:'var(--surface2)', borderRadius:'var(--radius-sm)',
                        padding:'12px', fontSize:'0.82rem', color:'var(--text2)',
                        whiteSpace:'pre-wrap', lineHeight:'1.7', fontFamily:'var(--font-sans)' }}>
                        {templateForm.body
                          .replace('{studentName}', 'Rahul Sharma')
                          .replace('{role}', 'Frontend Developer Intern')
                          .replace('{company}', 'Google')
                          .replace('{adminNote}', 'Great profile! We look forward to having you.')}
                      </div>
                    </div>
                  )}

                  <div style={{ display:'flex', gap:'10px' }}>
                    <button type="button" className="btn btn-outline" onClick={() => setEditTemplate(null)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading} style={{ flex:1 }}>
                      {loading ? 'Saving...' : '💾 Save Template'}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
