import React, { useState, useRef, useEffect } from 'react';
import Navbar from '../components/Navbar';
import DragDropResume from '../components/DragDropResume';
import {
  generateCoverLetter, getInterviewPrep,
  getJobMatchScore, parseResume, chatbotMessage,
  getAllInternships
} from '../services/api';
import { useAuth } from '../context/AuthContext';

const TABS = [
  { id:'cover',     label:'✍️ Cover Letter'     },
  { id:'interview', label:'🎤 Interview Prep'    },
  { id:'match',     label:'🎯 Job Match Score'   },
  { id:'parser',    label:'📄 Resume Parser'     },
  { id:'chatbot',   label:'🤖 AI Assistant'      },
];

export default function AIFeatures() {
  const { user } = useAuth();
  const [tab, setTab]       = useState('cover');
  const [loading, setLoading] = useState(false);
  const [internships, setInternships] = useState([]);

  useEffect(() => {
    getAllInternships().then(r => setInternships(r.data)).catch(() => {});
  }, []);

  return (
    <>
      <Navbar />
      <div className="page">
        <h1 className="page-title">🤖 AI Features</h1>
        <p style={{ color:'var(--text2)', fontSize:'0.88rem', marginBottom:'1.5rem' }}>
          Powered by intelligent algorithms — generate cover letters, practice interviews, check job fit, parse resume, and chat with our AI assistant.
        </p>

        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'1.5rem' }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding:'8px 16px', borderRadius:'20px', border:'1px solid', cursor:'pointer',
              fontSize:'0.85rem', fontWeight:500, transition:'all 0.2s',
              background: tab===t.id ? 'var(--accent)' : 'var(--surface)',
              borderColor: tab===t.id ? 'var(--accent)' : 'var(--border)',
              color: tab===t.id ? 'white' : 'var(--text2)',
            }}>{t.label}</button>
          ))}
        </div>

        {tab === 'cover'     && <CoverLetterTab user={user} internships={internships} />}
        {tab === 'interview' && <InterviewTab   user={user} internships={internships} />}
        {tab === 'match'     && <JobMatchTab    user={user} internships={internships} />}
        {tab === 'parser'    && <ResumeParserTab user={user} />}
        {tab === 'chatbot'   && <ChatbotTab     user={user} />}
      </div>
    </>
  );
}

// ── Cover Letter Tab ─────────────────────────────────────────────────────────
function CoverLetterTab({ user, internships }) {
  const [internshipId, setInternshipId] = useState('');
  const [tone, setTone]   = useState('professional');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    try {
      const r = await generateCoverLetter({ email: user.email, internshipId: internshipId || null, tone });
      if (r.data.success) setResult(r.data);
    } catch {}
    finally { setLoading(false); }
  };

  const copy = () => {
    navigator.clipboard.writeText(result.coverLetter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
      <div className="card">
        <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Generate Cover Letter</h3>
        <div className="form-group">
          <label>Select Internship (optional)</label>
          <select className="form-control" value={internshipId} onChange={e => setInternshipId(e.target.value)}>
            <option value="">General cover letter</option>
            {internships.map(i => <option key={i.id} value={i.id}>{i.role} — {i.companyName}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Tone</label>
          <select className="form-control" value={tone} onChange={e => setTone(e.target.value)}>
            <option value="professional">Professional</option>
            <option value="formal">Formal</option>
            <option value="enthusiastic">Enthusiastic</option>
          </select>
        </div>
        <div style={{ padding:'10px 12px', background:'rgba(59,130,246,0.08)', borderRadius:'8px', border:'1px solid rgba(59,130,246,0.2)', fontSize:'0.78rem', color:'var(--blue)', marginBottom:'1rem' }}>
          💡 The letter is auto-filled using your profile name, college, degree, and skills. Update your Profile first for best results.
        </div>
        <button className="btn btn-primary" style={{ width:'100%' }} onClick={generate} disabled={loading}>
          {loading ? 'Generating...' : '✍️ Generate Cover Letter'}
        </button>
        {result?.matchedSkills?.length > 0 && (
          <div style={{ marginTop:'1rem', fontSize:'0.78rem', color:'var(--green)' }}>
            ✅ Matched skills: {result.matchedSkills.join(', ')}
          </div>
        )}
      </div>

      <div className="card">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
          <h3 style={{ fontSize:'1rem' }}>Generated Letter</h3>
          {result && (
            <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
              <span style={{ fontSize:'0.75rem', color:'var(--text3)' }}>{result.wordCount} words</span>
              <button className="btn btn-outline btn-sm" onClick={copy}>{copied ? '✓ Copied!' : 'Copy'}</button>
            </div>
          )}
        </div>
        {result ? (
          <textarea readOnly value={result.coverLetter}
            style={{ width:'100%', minHeight:'340px', background:'var(--surface2)', border:'1px solid var(--border)',
              borderRadius:'8px', padding:'12px', fontSize:'0.82rem', lineHeight:'1.7',
              color:'var(--text2)', fontFamily:'var(--font-sans)', resize:'vertical' }} />
        ) : (
          <div style={{ height:'340px', display:'flex', alignItems:'center', justifyContent:'center', color:'var(--text3)', flexDirection:'column', gap:'10px' }}>
            <div style={{ fontSize:'3rem' }}>✍️</div>
            <p style={{ fontSize:'0.88rem' }}>Your cover letter will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Interview Prep Tab ────────────────────────────────────────────────────────
function InterviewTab({ user, internships }) {
  const [internshipId, setInternshipId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState(null);

  const generate = async () => {
    setLoading(true);
    try {
      const r = await getInterviewPrep(internshipId || null);
      if (r.data.success) setResult(r.data);
    } catch {}
    finally { setLoading(false); }
  };

  const types = ['All', 'General', 'Technical', 'HR'];
  const filtered = result?.questions?.filter(q => filter === 'All' || q.type === filter) || [];

  return (
    <div>
      <div className="card" style={{ marginBottom:'1.5rem' }}>
        <div style={{ display:'flex', gap:'1rem', alignItems:'flex-end', flexWrap:'wrap' }}>
          <div className="form-group" style={{ flex:1, margin:0 }}>
            <label style={{ fontSize:'0.78rem' }}>Select Internship (for role-specific questions)</label>
            <select className="form-control" value={internshipId} onChange={e => setInternshipId(e.target.value)}>
              <option value="">General tech interview</option>
              {internships.map(i => <option key={i.id} value={i.id}>{i.role} — {i.companyName}</option>)}
            </select>
          </div>
          <button className="btn btn-primary" onClick={generate} disabled={loading} style={{ flexShrink:0 }}>
            {loading ? 'Loading...' : '🎤 Get Questions'}
          </button>
        </div>
      </div>

      {result && (
        <>
          <div style={{ display:'flex', gap:'8px', marginBottom:'1rem' }}>
            {types.map(t => (
              <button key={t} onClick={() => setFilter(t)} style={{
                padding:'5px 14px', borderRadius:'16px', border:'1px solid', cursor:'pointer', fontSize:'0.82rem',
                background: filter===t ? 'var(--accent)' : 'var(--surface)',
                borderColor: filter===t ? 'var(--accent)' : 'var(--border)',
                color: filter===t ? 'white' : 'var(--text2)',
              }}>{t} ({result.questions.filter(q => t==='All' || q.type===t).length})</button>
            ))}
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:'10px', marginBottom:'1.5rem' }}>
            {filtered.map((q, i) => (
              <div key={i} className="card" style={{ padding:'1rem', cursor:'pointer' }}
                onClick={() => setExpanded(expanded===i ? null : i)}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'6px' }}>
                      <span style={{ fontSize:'0.72rem', padding:'2px 8px', borderRadius:'10px',
                        background: q.type==='Technical'?'rgba(124,107,255,0.1)':q.type==='HR'?'rgba(236,72,153,0.1)':'rgba(59,130,246,0.1)',
                        color: q.type==='Technical'?'var(--accent2)':q.type==='HR'?'var(--pink)':'var(--blue)',
                        fontWeight:600 }}>{q.type}</span>
                    </div>
                    <div style={{ fontWeight:600, fontSize:'0.92rem' }}>Q{i+1}. {q.question}</div>
                  </div>
                  <span style={{ color:'var(--text3)', marginLeft:'10px' }}>{expanded===i ? '▲' : '▼'}</span>
                </div>
                {expanded===i && (
                  <div style={{ marginTop:'10px', padding:'10px 12px', background:'rgba(34,197,94,0.06)', borderRadius:'8px', border:'1px solid rgba(34,197,94,0.2)', fontSize:'0.85rem', color:'var(--text2)', lineHeight:'1.6' }}>
                    💡 <strong>Tip:</strong> {q.tip}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="card">
            <h3 style={{ marginBottom:'0.75rem', fontSize:'1rem' }}>🏆 Interview Tips for {result.company}</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'6px' }}>
              {result.tips.map((t, i) => (
                <div key={i} style={{ display:'flex', gap:'8px', alignItems:'flex-start', fontSize:'0.85rem', color:'var(--text2)' }}>
                  <span style={{ color:'var(--accent2)', flexShrink:0 }}>→</span> {t}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// ── Job Match Tab ─────────────────────────────────────────────────────────────
function JobMatchTab({ user, internships }) {
  const [internshipId, setInternshipId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const check = async () => {
    if (!internshipId) return;
    setLoading(true);
    try {
      const r = await getJobMatchScore(internshipId);
      if (r.data.success) setResult(r.data);
    } catch {}
    finally { setLoading(false); }
  };

  const scoreColor = result ? (result.score>=80?'var(--green)':result.score>=60?'var(--accent2)':result.score>=40?'var(--amber)':'var(--red)') : 'var(--text3)';

  return (
    <div style={{ maxWidth:'700px' }}>
      <div className="card" style={{ marginBottom:'1.5rem' }}>
        <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Check How Well You Match an Internship</h3>
        <div className="form-group">
          <label>Select Internship</label>
          <select className="form-control" value={internshipId} onChange={e => setInternshipId(e.target.value)} required>
            <option value="">Choose an internship...</option>
            {internships.map(i => <option key={i.id} value={i.id}>{i.role} — {i.companyName}</option>)}
          </select>
        </div>
        <button className="btn btn-primary" onClick={check} disabled={loading || !internshipId} style={{ width:'100%' }}>
          {loading ? 'Analyzing...' : '🎯 Check My Match Score'}
        </button>
      </div>

      {result && (
        <div className="card">
          {/* Score circle */}
          <div style={{ textAlign:'center', marginBottom:'1.5rem', padding:'1rem' }}>
            <div style={{ width:'120px', height:'120px', borderRadius:'50%', margin:'0 auto 1rem',
              background: `conic-gradient(${result.verdictColor} ${result.score * 3.6}deg, var(--surface2) 0deg)`,
              display:'flex', alignItems:'center', justifyContent:'center', position:'relative' }}>
              <div style={{ width:'94px', height:'94px', borderRadius:'50%', background:'var(--surface)',
                display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column' }}>
                <span style={{ fontSize:'1.8rem', fontWeight:800, color: result.verdictColor, fontFamily:'Syne,sans-serif' }}>{result.score}%</span>
              </div>
            </div>
            <div style={{ fontWeight:700, fontSize:'1.1rem', color: result.verdictColor }}>{result.verdict}</div>
          </div>

          {/* Breakdown */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px', marginBottom:'1.2rem' }}>
            {[
              { label:'Skill Match',    value: result.skillScore + '%',   color:'var(--accent2)' },
              { label:'Profile Bonus',  value: '+' + result.profileBonus, color:'var(--blue)'    },
              { label:'Resume Bonus',   value: '+' + result.resumeBonus,  color:'var(--green)'   },
            ].map(s => (
              <div key={s.label} style={{ textAlign:'center', padding:'10px', background:'var(--surface2)', borderRadius:'8px' }}>
                <div style={{ fontSize:'1.2rem', fontWeight:700, color:s.color }}>{s.value}</div>
                <div style={{ fontSize:'0.74rem', color:'var(--text3)', marginTop:'2px' }}>{s.label}</div>
              </div>
            ))}
          </div>

          {result.matchedSkills.length > 0 && (
            <div style={{ marginBottom:'1rem' }}>
              <div style={{ fontSize:'0.78rem', color:'var(--text3)', marginBottom:'6px' }}>✅ Matched Skills</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                {result.matchedSkills.map(s => <span key={s} className="meta-chip green" style={{ fontSize:'0.78rem' }}>{s}</span>)}
              </div>
            </div>
          )}

          {result.missingSkills.length > 0 && (
            <div style={{ marginBottom:'1rem' }}>
              <div style={{ fontSize:'0.78rem', color:'var(--text3)', marginBottom:'6px' }}>❌ Missing Skills</div>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                {result.missingSkills.map(s => <span key={s} className="meta-chip" style={{ fontSize:'0.78rem', borderColor:'rgba(239,68,68,0.3)', color:'var(--red)' }}>{s}</span>)}
              </div>
            </div>
          )}

          <div>
            <div style={{ fontSize:'0.78rem', color:'var(--text3)', marginBottom:'6px' }}>💡 Suggestions</div>
            {result.suggestions.map((s, i) => (
              <div key={i} style={{ padding:'7px 10px', background:'var(--surface2)', borderRadius:'6px', fontSize:'0.82rem', color:'var(--text2)', marginBottom:'5px' }}>
                → {s}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Resume Parser Tab ─────────────────────────────────────────────────────────
function ResumeParserTab({ user }) {
  const [file, setFile]     = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg]       = useState('');

  const parse = async () => {
    if (!file) return;
    setLoading(true); setMsg('');
    try {
      const r = await parseResume(file);
      if (r.data.success) { setResult(r.data.parsed); setMsg(r.data.message); }
      else setMsg(r.data.message);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
      <div className="card">
        <h3 style={{ marginBottom:'0.75rem', fontSize:'1rem' }}>Auto-Fill Profile from Resume</h3>
        <p style={{ fontSize:'0.82rem', color:'var(--text2)', marginBottom:'1rem', lineHeight:'1.6' }}>
          Upload your resume and we will automatically extract your name, phone, college, degree, skills, LinkedIn, and GitHub — and update your profile instantly.
        </p>
        <DragDropResume onFileSelect={setFile} label="Resume (PDF or TXT)" />
        {msg && <div className={`alert ${msg.includes('failed') ? 'alert-error' : 'alert-success'}`} style={{ marginTop:'10px' }}>{msg}</div>}
        <button className="btn btn-primary" style={{ width:'100%', marginTop:'1rem' }}
          onClick={parse} disabled={loading || !file}>
          {loading ? 'Parsing...' : '📄 Parse & Update Profile'}
        </button>
      </div>

      <div className="card">
        <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Extracted Information</h3>
        {result ? (
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            {Object.entries(result).map(([k, v]) => v && (
              <div key={k} style={{ display:'flex', gap:'10px', padding:'8px 10px', background:'var(--surface2)', borderRadius:'6px' }}>
                <span style={{ fontSize:'0.75rem', color:'var(--text3)', minWidth:'90px', paddingTop:'1px', textTransform:'capitalize' }}>
                  {k.replace(/([A-Z])/g,' $1').trim()}
                </span>
                <span style={{ fontSize:'0.85rem', color:'var(--text)', fontWeight:500, flex:1, wordBreak:'break-all' }}>{String(v)}</span>
                <span style={{ color:'var(--green)', fontSize:'0.8rem' }}>✓</span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ height:'280px', display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', color:'var(--text3)', gap:'10px' }}>
            <div style={{ fontSize:'3rem' }}>📄</div>
            <p style={{ fontSize:'0.85rem' }}>Extracted fields will appear here</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Chatbot Tab ───────────────────────────────────────────────────────────────

// ── Chatbot Tab ───────────────────────────────────────────────────────────────
function ChatbotTab({ user }) {
  const [messages, setMessages] = useState([
    { role:'bot', text:"Hi " + (user.name?.split(' ')[0] || 'there') + "! 👋 I'm your InternHub AI Assistant powered by Claude.\n\nI can help with anything — applying to internships, badges, streaks, AI features, career tips, interview advice, and much more. What would you like to know?" }
  ]);
  const [input, setInput]       = useState('');
  const [loading, setLoading]   = useState(false);
  const [isAI, setIsAI]         = useState(false);
  const bottomRef               = useRef(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [messages]);

  // Build history in Claude API format (exclude first bot greeting)
  const buildHistory = () => {
    const hist = [];
    for (let i = 1; i < messages.length; i++) {
      const m = messages[i];
      if (m.role === 'user') hist.push({ role:'user',      content: m.text });
      else                   hist.push({ role:'assistant', content: m.text });
    }
    return hist;
  };

  const localFallback = (q) => {
    const t = q.toLowerCase().replace(/[?!,]/g,'');
    const has = (w) => t.includes(w);
    if (has('hello')||has('hi')||has('hey')) return "Hi there! 👋 Ask me about applying, badges, streaks, AI features, or anything about InternHub!";
    if (has('apply')||has('application')) return "To apply:\n1️⃣ Go to Explore\n2️⃣ Click an internship\n3️⃣ Click Apply Now\n4️⃣ Write cover letter\n5️⃣ Submit!\n\nTrack on My Applications page.";
    if (has('badge')) return "12 badges to earn! First Step (1st apply), Explorer (5 apps), Go-Getter (10 apps), Profile Pro (80% profile), Resume Ready, Accepted!, Interview Star, Certified, and more. Each gives +50 pts!";
    if (has('point')||has('earn')&&has('point')) return "Earn points:\n📝 Apply = +10\n📄 Resume = +20\n⭐ 80% profile = +50\n🤝 Referral = +30\n📜 Certificate = +25\nCheck 🏆 Gamification for all!";
    if (has('streak')) return "Apply every day to build a streak! 3 days = Hot Streak badge, 7 days = Week Warrior, 30 days = Unstoppable. Bonus pts = 5 × streak days!";
    if (has('resume')&&has('upload')||has('upload')&&has('resume')) return "Profile → Resume & Photo tab → drag & drop PDF → Upload Resume. Auto-attaches to all applications!";
    if (has('cover letter')||has('cover')&&has('letter')) return "🤖 AI Features → Cover Letter tab → select internship → choose tone → Generate! Personalized using your profile skills.";
    if (has('interview')&&(has('prep')||has('practice')||has('question'))) return "🤖 AI Features → Interview Prep → select internship → Get Questions! Role-specific General, Technical & HR questions with tips.";
    if (has('job match')||has('match')&&has('score')) return "🤖 AI Features → Job Match Score → select internship → Check Score! Based on skill match (70%), profile bonus (+8), resume bonus (+5).";
    if (has('2fa')||has('two factor')) return "🔒 Security Settings → Enable 2FA. Each login needs password + 6-digit email code. Super secure!";
    if (has('forgot')&&has('password')||has('reset')&&has('password')) return "Login page → Forgot password? → Enter email → Enter OTP from email → Set new password. OTP expires in 10 mins!";
    if (has('streak')) return "Apply every day to build a streak! 3 days = Hot Streak, 7 days = Week Warrior badge!";
    if (has('profile')&&(has('complete')||has('percent'))) return "Complete: Name 15%, Bio 15%, Skills 15%, College 10%, Degree 10%, Phone 10%, Resume 15%, Photo 10%. Hit 80% for Profile Pro badge!";
    if (has('level')||has('rank')) return "Levels: Bronze(0-74) → Silver(75-149) → Gold(150-299) → Platinum(300-499) → Diamond(500+). Check 🏆 Gamification!";
    if (has('referral')||has('refer')) return "Features → Referral section → copy your code → share with friends → earn 30pts per signup!";
    if (has('save')||has('bookmark')) return "Click ☆ on any internship card to bookmark it. View saved ones in the Saved page!";
    if (has('thank')) return "You're welcome! 😊 Good luck with your internship hunt!";
    return "I can help with:\n📝 Applying · 🏅 Badges · 🔥 Streaks\n🤖 AI Features · 🔒 Security · 💰 Points\n\nJust ask your question naturally! 😊";
  };

  const send = async (text) => {
    const q = (text || input).trim();
    if (!q) return;
    setInput('');
    setMessages(m => [...m, { role:'user', text:q }]);
    setLoading(true);
    try {
      const r = await chatbotMessage({ message: q, history: buildHistory() });
      if (r.data && r.data.reply) {
        setIsAI(r.data.source === 'claude');
        setMessages(m => [...m, { role:'bot', text:r.data.reply }]);
      } else {
        setMessages(m => [...m, { role:'bot', text:localFallback(q) }]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      // Use local fallback instead of error message
      setMessages(m => [...m, { role:'bot', text:localFallback(q) }]);
    }
    finally { setLoading(false); }
  };

  const handleSubmit = (e) => { e.preventDefault(); send(); };

  const quickQ = [
    'How do I apply?',
    'How do I earn badges?',
    'What is a streak?',
    'How to upload resume?',
    'What is 2FA?',
    'What are AI features?',
    'How is job match calculated?',
    'How to earn points?',
  ];

  const formatText = (text) => {
    // Convert newlines to <br> and preserve formatting
    return text.split('\n').map((line, i) => (
      <span key={i}>{line}{i < text.split('\n').length - 1 && <br/>}</span>
    ));
  };

  return (
    <div style={{ maxWidth:'760px' }}>
      {/* AI Status badge */}
      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
        <div style={{
          display:'flex', alignItems:'center', gap:'6px', padding:'5px 12px',
          borderRadius:'20px', fontSize:'0.78rem', fontWeight:600,
          background: isAI ? 'rgba(34,197,94,0.1)' : 'rgba(124,107,255,0.1)',
          border: `1px solid ${isAI ? 'rgba(34,197,94,0.3)' : 'rgba(124,107,255,0.3)'}`,
          color: isAI ? 'var(--green)' : 'var(--accent2)',
        }}>
          <span style={{ width:'7px', height:'7px', borderRadius:'50%', background: isAI ? 'var(--green)' : 'var(--accent2)', display:'inline-block' }} />
          {isAI ? '🧠 Powered by Claude AI' : '🤖 AI Assistant (Keyword Mode)'}
        </div>
        {!isAI && (
          <span style={{ fontSize:'0.75rem', color:'var(--text3)' }}>
            Add Anthropic API key in application.properties for full AI
          </span>
        )}
      </div>

      <div className="card" style={{ display:'flex', flexDirection:'column', height:'580px' }}>
        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'1.2rem', display:'flex', flexDirection:'column', gap:'12px' }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display:'flex', justifyContent: m.role==='user' ? 'flex-end' : 'flex-start', alignItems:'flex-end', gap:'8px' }}>
              {m.role === 'bot' && (
                <div style={{
                  width:'34px', height:'34px', borderRadius:'50%', flexShrink:0,
                  background:'linear-gradient(135deg, var(--accent), var(--accent2))',
                  display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem',
                }}>🤖</div>
              )}
              <div style={{
                maxWidth:'78%', padding:'12px 16px',
                borderRadius: m.role==='user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                background: m.role==='user'
                  ? 'linear-gradient(135deg, var(--accent), var(--accent2))'
                  : 'var(--surface2)',
                color: m.role==='user' ? 'white' : 'var(--text)',
                fontSize:'0.88rem', lineHeight:'1.65',
                boxShadow: m.role==='user' ? '0 2px 12px rgba(124,107,255,0.3)' : 'none',
              }}>
                {formatText(m.text)}
              </div>
              {m.role === 'user' && (
                <div style={{
                  width:'32px', height:'32px', borderRadius:'50%', flexShrink:0,
                  background:'var(--surface2)', display:'flex', alignItems:'center',
                  justifyContent:'center', color:'var(--accent2)', fontWeight:700, fontSize:'0.85rem',
                }}>
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
              )}
            </div>
          ))}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display:'flex', alignItems:'flex-end', gap:'8px' }}>
              <div style={{ width:'34px', height:'34px', borderRadius:'50%', background:'linear-gradient(135deg, var(--accent), var(--accent2))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem' }}>🤖</div>
              <div style={{ padding:'12px 18px', background:'var(--surface2)', borderRadius:'20px 20px 20px 4px', display:'flex', gap:'5px', alignItems:'center' }}>
                {[0,1,2].map(i => (
                  <div key={i} style={{
                    width:'8px', height:'8px', borderRadius:'50%', background:'var(--accent2)',
                    animation:'bounce 1.2s ease-in-out infinite',
                    animationDelay: `${i * 0.2}s`,
                    opacity:0.7,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Quick question chips */}
        <div style={{ padding:'10px 14px', display:'flex', gap:'6px', flexWrap:'wrap', borderTop:'1px solid var(--border)', background:'var(--surface)' }}>
          {quickQ.map(q => (
            <button key={q} onClick={() => send(q)} disabled={loading}
              style={{ padding:'4px 12px', borderRadius:'16px', border:'1px solid var(--border)',
                background:'var(--surface2)', color:'var(--text2)', fontSize:'0.75rem',
                cursor:'pointer', transition:'all 0.15s', whiteSpace:'nowrap' }}>
              {q}
            </button>
          ))}
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} style={{ padding:'12px 16px', borderTop:'1px solid var(--border)', display:'flex', gap:'10px', alignItems:'center' }}>
          <input className="form-control" placeholder="Ask me anything about InternHub..."
            value={input} onChange={e => setInput(e.target.value)} disabled={loading}
            style={{ flex:1, padding:'11px 18px', borderRadius:'24px', fontSize:'0.88rem' }} />
          <button className="btn btn-primary" type="submit" disabled={loading || !input.trim()}
            style={{ borderRadius:'24px', padding:'11px 24px', flexShrink:0 }}>
            {loading ? '...' : 'Send →'}
          </button>
        </form>
      </div>

      <style>{`
        @keyframes bounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
