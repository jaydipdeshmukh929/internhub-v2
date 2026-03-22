import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const genCert      = d => API.post('/documents/certificate', d);
const genOffer     = d => API.post('/documents/offer-letter', d);
const genNOC       = d => API.post('/documents/noc', d);

const TABS = [
  { id:'cert',  label:'🏅 Completion Certificate' },
  { id:'offer', label:'📄 Offer Letter'            },
  { id:'noc',   label:'🎓 NOC for College'         },
  { id:'resume',label:'📝 Resume Builder'          },
];

export default function Documents() {
  const { user } = useAuth();
  const [tab, setTab]       = useState('cert');
  const [loading, setLoading] = useState(false);
  const [html, setHtml]     = useState('');
  const [msg, setMsg]       = useState('');

  const showDoc = (htmlContent) => {
    setHtml(htmlContent);
    setTimeout(() => {
      const win = window.open('', '_blank');
      win.document.write(htmlContent);
      win.document.close();
    }, 100);
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <h1 className="page-title">📄 Documents & Certificates</h1>
        <p style={{ color:'var(--text2)', fontSize:'0.88rem', marginBottom:'1.5rem' }}>
          Generate professional documents instantly — certificates, offer letters, NOC, and resume.
        </p>

        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'1.5rem' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => { setTab(t.id); setHtml(''); setMsg(''); }} style={{
              padding:'8px 16px', borderRadius:'20px', border:'1px solid', cursor:'pointer', fontSize:'0.85rem', fontWeight:500,
              background: tab===t.id ? 'var(--accent)' : 'var(--surface)',
              borderColor: tab===t.id ? 'var(--accent)' : 'var(--border)',
              color: tab===t.id ? 'white' : 'var(--text2)',
            }}>{t.label}</button>
          ))}
        </div>

        {msg && <div className="alert alert-success">{msg}</div>}

        {tab === 'cert'  && <CertTab  user={user} loading={loading} setLoading={setLoading} showDoc={showDoc} setMsg={setMsg} />}
        {tab === 'offer' && <OfferTab user={user} loading={loading} setLoading={setLoading} showDoc={showDoc} setMsg={setMsg} />}
        {tab === 'noc'   && <NOCTab   user={user} loading={loading} setLoading={setLoading} showDoc={showDoc} setMsg={setMsg} />}
        {tab === 'resume'&& <ResumeBuilderTab user={user} />}
      </div>
    </>
  );
}

function CertTab({ user, loading, setLoading, showDoc, setMsg }) {
  const [form, setForm] = useState({ company:'', role:'', duration:'', completionDate:'' });
  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const r = await genCert({ ...form, email: user.email });
      if (r.data.success) { showDoc(r.data.html); setMsg('Certificate generated! Opening in new tab...'); }
    } catch {}
    finally { setLoading(false); }
  };
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
      <form onSubmit={submit} className="card">
        <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Generate Completion Certificate</h3>
        {[['company','Company Name','Google'],['role','Your Role','Frontend Developer Intern'],['duration','Duration','3 months'],['completionDate','Completion Date','March 2026']].map(([k,l,p]) => (
          <div className="form-group" key={k}>
            <label>{l}</label>
            <input className="form-control" placeholder={p} value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} required />
          </div>
        ))}
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width:'100%' }}>
          {loading ? 'Generating...' : '🏅 Generate Certificate'}
        </button>
      </form>
      <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px' }}>
        <div style={{ fontSize:'4rem' }}>🏅</div>
        <h3 style={{ fontSize:'1rem' }}>Beautiful PDF Certificate</h3>
        <p style={{ fontSize:'0.83rem', color:'var(--text2)', textAlign:'center', lineHeight:'1.7' }}>
          Professional certificate with decorative border, your name in elegant typography, company details, and unique certificate ID. Opens in a new tab ready to print or save as PDF.
        </p>
        <div style={{ display:'flex', flexDirection:'column', gap:'6px', width:'100%' }}>
          {['✓ Your name in elegant font','✓ Company & role details','✓ Duration and completion date','✓ Unique certificate ID','✓ InternHub branding','✓ Print or save as PDF'].map(f=>(
            <div key={f} style={{ fontSize:'0.82rem', color:'var(--text2)' }}>{f}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

function OfferTab({ user, loading, setLoading, showDoc, setMsg }) {
  const [form, setForm] = useState({ company:'', role:'', startDate:'', stipend:'', duration:'' });
  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const r = await genOffer({ ...form, email: user.email });
      if (r.data.success) { showDoc(r.data.html); setMsg('Offer letter generated!'); }
    } catch {}
    finally { setLoading(false); }
  };
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
      <form onSubmit={submit} className="card">
        <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Generate Offer Letter</h3>
        {[['company','Company Name','Google'],['role','Position/Role','Software Developer Intern'],['startDate','Start Date','April 1, 2026'],['stipend','Monthly Stipend (₹)','15000'],['duration','Duration','3 months']].map(([k,l,p]) => (
          <div className="form-group" key={k}>
            <label>{l}</label>
            <input className="form-control" placeholder={p} value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} required />
          </div>
        ))}
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width:'100%' }}>
          {loading ? 'Generating...' : '📄 Generate Offer Letter'}
        </button>
      </form>
      <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px' }}>
        <div style={{ fontSize:'4rem' }}>📄</div>
        <h3 style={{ fontSize:'1rem' }}>Professional Offer Letter</h3>
        <p style={{ fontSize:'0.83rem', color:'var(--text2)', textAlign:'center', lineHeight:'1.7' }}>
          Formal offer letter with company letterhead, position details, stipend, start date, and authorized signatures. Ready to print and sign.
        </p>
      </div>
    </div>
  );
}

function NOCTab({ user, loading, setLoading, showDoc, setMsg }) {
  const [form, setForm] = useState({ company:'', role:'', startDate:'', endDate:'' });
  const submit = async (e) => {
    e.preventDefault(); setLoading(true);
    try {
      const r = await genNOC({ ...form, email: user.email });
      if (r.data.success) { showDoc(r.data.html); setMsg('NOC generated! NOC No: ' + r.data.nocNumber); }
    } catch {}
    finally { setLoading(false); }
  };
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
      <form onSubmit={submit} className="card">
        <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Generate NOC for College</h3>
        <div style={{ padding:'10px 14px', background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:'8px', fontSize:'0.78rem', color:'var(--blue)', marginBottom:'1rem' }}>
          💡 NOC uses your college name and degree from your profile. Make sure your profile is updated!
        </div>
        {[['company','Company Name','Google'],['role','Position/Role','Software Developer Intern'],['startDate','Internship Start Date','April 1, 2026'],['endDate','Internship End Date','June 30, 2026']].map(([k,l,p]) => (
          <div className="form-group" key={k}>
            <label>{l}</label>
            <input className="form-control" placeholder={p} value={form[k]} onChange={e => setForm(f=>({...f,[k]:e.target.value}))} required />
          </div>
        ))}
        <button className="btn btn-primary" type="submit" disabled={loading} style={{ width:'100%' }}>
          {loading ? 'Generating...' : '🎓 Generate NOC'}
        </button>
      </form>
      <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px' }}>
        <div style={{ fontSize:'4rem' }}>🎓</div>
        <h3 style={{ fontSize:'1rem' }}>Official NOC Letter</h3>
        <p style={{ fontSize:'0.83rem', color:'var(--text2)', textAlign:'center', lineHeight:'1.7' }}>
          No Objection Certificate on college letterhead with reference number, your details, internship period, HOD signature area, and official seal placeholder.
        </p>
      </div>
    </div>
  );
}

function ResumeBuilderTab({ user }) {
  const [form, setForm] = useState({
    name: user.name || '', email: user.email || '', phone: '', location: '',
    linkedin: '', github: '', summary: '', skills: '',
    exp1Company:'', exp1Role:'', exp1Date:'', exp1Desc:'',
    edu1College:'', edu1Degree:'', edu1Year:'', edu1Score:'',
    proj1Name:'', proj1Tech:'', proj1Desc:'',
    proj2Name:'', proj2Tech:'', proj2Desc:'',
  });
  const [generated, setGenerated] = useState(false);

  const setF = (k,v) => setForm(f=>({...f,[k]:v}));

  const generateResume = () => {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8">
<style>
  body{font-family:'Calibri',sans-serif;max-width:800px;margin:30px auto;padding:40px;color:#1a1a2e;font-size:14px;line-height:1.5;}
  .name{font-size:32px;font-weight:700;color:#6c63ff;margin-bottom:4px;}
  .contact{font-size:12px;color:#555;margin-bottom:20px;display:flex;gap:20px;flex-wrap:wrap;}
  .contact a{color:#6c63ff;text-decoration:none;}
  .section{margin-bottom:20px;}
  .section-title{font-size:14px;font-weight:700;color:#6c63ff;text-transform:uppercase;letter-spacing:1px;border-bottom:2px solid #6c63ff;padding-bottom:3px;margin-bottom:10px;}
  .item{margin-bottom:12px;}
  .item-header{display:flex;justify-content:space-between;font-weight:600;}
  .item-sub{font-size:12px;color:#555;margin-bottom:4px;}
  .skills-list{display:flex;flex-wrap:wrap;gap:8px;}
  .skill{background:#f0eeff;color:#6c63ff;padding:3px 10px;border-radius:12px;font-size:12px;}
  @media print{body{margin:0;padding:20px;}}
</style>
</head><body>
<div class="name">${form.name}</div>
<div class="contact">
  ${form.email ? `<span>📧 ${form.email}</span>` : ''}
  ${form.phone ? `<span>📞 ${form.phone}</span>` : ''}
  ${form.location ? `<span>📍 ${form.location}</span>` : ''}
  ${form.linkedin ? `<a href="${form.linkedin}">🔗 LinkedIn</a>` : ''}
  ${form.github ? `<a href="${form.github}">💻 GitHub</a>` : ''}
</div>
${form.summary ? `<div class="section"><div class="section-title">Summary</div><p>${form.summary}</p></div>` : ''}
${form.skills ? `<div class="section"><div class="section-title">Technical Skills</div><div class="skills-list">${form.skills.split(',').map(s=>`<span class="skill">${s.trim()}</span>`).join('')}</div></div>` : ''}
${form.exp1Company ? `<div class="section"><div class="section-title">Experience</div><div class="item"><div class="item-header"><span>${form.exp1Role}</span><span>${form.exp1Date}</span></div><div class="item-sub">${form.exp1Company}</div><p>${form.exp1Desc}</p></div></div>` : ''}
${form.edu1College ? `<div class="section"><div class="section-title">Education</div><div class="item"><div class="item-header"><span>${form.edu1Degree}</span><span>${form.edu1Year}</span></div><div class="item-sub">${form.edu1College} ${form.edu1Score ? '| CGPA: '+form.edu1Score : ''}</div></div></div>` : ''}
${form.proj1Name ? `<div class="section"><div class="section-title">Projects</div>
${form.proj1Name ? `<div class="item"><div class="item-header"><span>${form.proj1Name}</span><span style="font-size:12px;color:#555;">${form.proj1Tech}</span></div><p>${form.proj1Desc}</p></div>` : ''}
${form.proj2Name ? `<div class="item"><div class="item-header"><span>${form.proj2Name}</span><span style="font-size:12px;color:#555;">${form.proj2Tech}</span></div><p>${form.proj2Desc}</p></div>` : ''}
</div>` : ''}
</body></html>`;
    const win = window.open('', '_blank');
    win.document.write(html);
    win.document.close();
    setGenerated(true);
  };

  const Section = ({title, children}) => (
    <div style={{ marginBottom:'1rem' }}>
      <div style={{ fontSize:'0.78rem', fontWeight:700, color:'var(--accent2)', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'8px', paddingBottom:'4px', borderBottom:'1px solid var(--border)' }}>{title}</div>
      {children}
    </div>
  );

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
      <div className="card" style={{ maxHeight:'70vh', overflowY:'auto' }}>
        <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>📝 Resume Builder</h3>
        <Section title="Personal Info">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {[['name','Full Name'],['email','Email'],['phone','Phone'],['location','Location'],['linkedin','LinkedIn URL'],['github','GitHub URL']].map(([k,l])=>(
              <div className="form-group" key={k} style={{ margin:0 }}>
                <label style={{ fontSize:'0.75rem' }}>{l}</label>
                <input className="form-control" value={form[k]} onChange={e=>setF(k,e.target.value)} style={{ padding:'6px 10px', fontSize:'0.82rem' }} />
              </div>
            ))}
          </div>
        </Section>
        <Section title="Summary">
          <textarea className="form-control" rows={2} placeholder="Brief professional summary..." value={form.summary} onChange={e=>setF('summary',e.target.value)} style={{ fontSize:'0.82rem' }} />
        </Section>
        <Section title="Skills (comma-separated)">
          <input className="form-control" placeholder="React, Node.js, Python, MySQL..." value={form.skills} onChange={e=>setF('skills',e.target.value)} style={{ fontSize:'0.82rem' }} />
        </Section>
        <Section title="Experience">
          {[['exp1Company','Company'],['exp1Role','Role'],['exp1Date','Duration'],['exp1Desc','Description']].map(([k,l])=>(
            <div className="form-group" key={k} style={{ marginBottom:'6px' }}>
              <label style={{ fontSize:'0.75rem' }}>{l}</label>
              {k==='exp1Desc' ? <textarea className="form-control" rows={2} value={form[k]} onChange={e=>setF(k,e.target.value)} style={{ fontSize:'0.82rem' }} /> : <input className="form-control" value={form[k]} onChange={e=>setF(k,e.target.value)} style={{ padding:'6px 10px', fontSize:'0.82rem' }} />}
            </div>
          ))}
        </Section>
        <Section title="Education">
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px' }}>
            {[['edu1College','College'],['edu1Degree','Degree'],['edu1Year','Year'],['edu1Score','CGPA/Score']].map(([k,l])=>(
              <div className="form-group" key={k} style={{ margin:0 }}>
                <label style={{ fontSize:'0.75rem' }}>{l}</label>
                <input className="form-control" value={form[k]} onChange={e=>setF(k,e.target.value)} style={{ padding:'6px 10px', fontSize:'0.82rem' }} />
              </div>
            ))}
          </div>
        </Section>
        <Section title="Projects">
          {[1,2].map(n => (
            <div key={n} style={{ marginBottom:'8px', padding:'8px', background:'var(--surface2)', borderRadius:'6px' }}>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'6px', marginBottom:'6px' }}>
                <input className="form-control" placeholder="Project Name" value={form[`proj${n}Name`]} onChange={e=>setF(`proj${n}Name`,e.target.value)} style={{ padding:'6px 10px', fontSize:'0.82rem' }} />
                <input className="form-control" placeholder="Tech Stack" value={form[`proj${n}Tech`]} onChange={e=>setF(`proj${n}Tech`,e.target.value)} style={{ padding:'6px 10px', fontSize:'0.82rem' }} />
              </div>
              <textarea className="form-control" rows={2} placeholder="Project description..." value={form[`proj${n}Desc`]} onChange={e=>setF(`proj${n}Desc`,e.target.value)} style={{ fontSize:'0.82rem' }} />
            </div>
          ))}
        </Section>
        <button className="btn btn-primary" onClick={generateResume} style={{ width:'100%', marginTop:'0.5rem' }}>
          📝 Generate Resume →
        </button>
      </div>
      <div className="card" style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'12px' }}>
        <div style={{ fontSize:'4rem' }}>{generated ? '✅' : '📝'}</div>
        <h3 style={{ fontSize:'1rem' }}>{generated ? 'Resume Generated!' : 'Resume Preview'}</h3>
        <p style={{ fontSize:'0.83rem', color:'var(--text2)', textAlign:'center', lineHeight:'1.7' }}>
          {generated ? 'Your resume opened in a new tab. Use Ctrl+P to save as PDF!' : 'Fill in the form and click Generate. Your resume opens in a new tab with clean professional formatting. Use Ctrl+P (or Cmd+P on Mac) to save as PDF.'}
        </p>
        {generated && <button className="btn btn-outline btn-sm" onClick={generateResume}>Regenerate</button>}
      </div>
    </div>
  );
}
