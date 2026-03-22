import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import API from '../services/api';

const getProfile = slug => API.get(`/student/${slug}`);

export default function PublicProfile() {
  const { slug } = useParams();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile(slug)
      .then(r => { if (r.data.found) setProfile(r.data.profile); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'2rem', marginBottom:'10px' }}>⚡</div>
        <p style={{ color:'var(--text2)' }}>Loading profile...</p>
      </div>
    </div>
  );

  if (!profile) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)', flexDirection:'column', gap:'12px' }}>
      <div style={{ fontSize:'3rem' }}>🔍</div>
      <h2 style={{ color:'var(--text)' }}>Profile Not Found</h2>
      <p style={{ color:'var(--text2)' }}>This profile is either private or doesn't exist.</p>
      <Link to="/home" className="btn btn-primary">Go to InternHub</Link>
    </div>
  );

  const levelColor = p => p>=500?'#b9f2ff':p>=300?'#e5e4e2':p>=150?'#ffd700':p>=75?'#c0c0c0':'#cd7f32';
  const level = p => p>=500?'Diamond':p>=300?'Platinum':p>=150?'Gold':p>=75?'Silver':'Bronze';
  const pts = profile.points || 0;

  return (
    <div style={{ minHeight:'100vh', background:'var(--bg)', padding:'2rem 1rem' }}>
      <div style={{ maxWidth:'760px', margin:'0 auto' }}>
        {/* Header */}
        <div style={{ background:'linear-gradient(135deg, var(--accent), var(--accent2))', borderRadius:'16px', padding:'2rem', marginBottom:'1.5rem', color:'white', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:'-40px', right:'-40px', width:'200px', height:'200px', background:'rgba(255,255,255,0.05)', borderRadius:'50%' }} />
          <div style={{ display:'flex', gap:'1.5rem', alignItems:'center', flexWrap:'wrap', position:'relative' }}>
            <div style={{ width:'90px', height:'90px', borderRadius:'50%', background:'rgba(255,255,255,0.2)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2.5rem', fontWeight:700, flexShrink:0 }}>
              {profile.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <h1 style={{ fontSize:'1.8rem', margin:'0 0 4px', fontFamily:'Syne,sans-serif' }}>{profile.name}</h1>
              {profile.college && <div style={{ opacity:0.85, fontSize:'0.9rem', marginBottom:'6px' }}>🎓 {profile.college} {profile.degree && `· ${profile.degree}`}</div>}
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                {profile.isAlumni && <span style={{ background:'rgba(255,255,255,0.2)', padding:'3px 10px', borderRadius:'10px', fontSize:'0.75rem', fontWeight:600 }}>🏆 Alumni</span>}
                {profile.isPremium && <span style={{ background:'rgba(255,215,0,0.3)', padding:'3px 10px', borderRadius:'10px', fontSize:'0.75rem', fontWeight:600 }}>⭐ Premium</span>}
                <span style={{ background:'rgba(255,255,255,0.2)', padding:'3px 10px', borderRadius:'10px', fontSize:'0.75rem', fontWeight:600, color:levelColor(pts) }}>
                  {level(pts)} · {pts} pts
                </span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'1.5rem' }}>
          <div>
            {/* Bio */}
            {profile.bio && (
              <div className="card" style={{ marginBottom:'1rem' }}>
                <h3 style={{ fontSize:'0.95rem', marginBottom:'8px' }}>About</h3>
                <p style={{ fontSize:'0.88rem', color:'var(--text2)', lineHeight:'1.7' }}>{profile.bio}</p>
              </div>
            )}

            {/* Skills */}
            {profile.skills && (
              <div className="card" style={{ marginBottom:'1rem' }}>
                <h3 style={{ fontSize:'0.95rem', marginBottom:'10px' }}>🛠 Skills</h3>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {profile.skills.split(',').map((s,i) => s.trim() && (
                    <span key={i} className="tag" style={{ fontSize:'0.8rem' }}>{s.trim()}</span>
                  ))}
                </div>
              </div>
            )}

            {/* Portfolio */}
            {profile.portfolioLinks && profile.portfolioLinks !== '[]' && (
              <div className="card" style={{ marginBottom:'1rem' }}>
                <h3 style={{ fontSize:'0.95rem', marginBottom:'10px' }}>💼 Projects</h3>
                {(() => {
                  try {
                    const links = JSON.parse(profile.portfolioLinks);
                    return links.map((p,i) => (
                      <a key={i} href={p.url} target="_blank" rel="noreferrer"
                        style={{ display:'flex', gap:'10px', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)', textDecoration:'none', color:'var(--text)' }}>
                        <span style={{ fontSize:'1.2rem' }}>🔗</span>
                        <div>
                          <div style={{ fontWeight:600, fontSize:'0.88rem' }}>{p.title}</div>
                          <div style={{ fontSize:'0.75rem', color:'var(--accent2)' }}>{p.url}</div>
                        </div>
                      </a>
                    ));
                  } catch { return null; }
                })()}
              </div>
            )}

            {/* Badges */}
            {profile.badges?.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize:'0.95rem', marginBottom:'10px' }}>🏅 Badges ({profile.badges.length})</h3>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'8px' }}>
                  {profile.badges.map(b => (
                    <div key={b.id} title={b.badgeDescription} style={{ padding:'6px 12px', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:'20px', fontSize:'0.8rem', color:'var(--amber)' }}>
                      {b.badgeIcon} {b.badgeName}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            {/* Stats */}
            <div className="card" style={{ marginBottom:'1rem' }}>
              <h3 style={{ fontSize:'0.95rem', marginBottom:'12px' }}>📊 Stats</h3>
              {[
                ['Applications', profile.applicationsCount || 0, '📝'],
                ['Points', profile.points || 0, '⭐'],
                ['Badges', profile.badges?.length || 0, '🏅'],
                ['Profile', (profile.profileCompletion||0) + '%', '✅'],
              ].map(([l,v,i]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ fontSize:'0.83rem', color:'var(--text2)' }}>{i} {l}</span>
                  <span style={{ fontWeight:700, color:'var(--accent2)' }}>{v}</span>
                </div>
              ))}
            </div>

            {/* Links */}
            <div className="card">
              <h3 style={{ fontSize:'0.95rem', marginBottom:'10px' }}>🔗 Links</h3>
              {profile.linkedinUrl && <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" style={{ display:'block', padding:'7px 10px', background:'rgba(59,130,246,0.08)', borderRadius:'6px', color:'var(--blue)', fontSize:'0.83rem', textDecoration:'none', marginBottom:'6px' }}>🔗 LinkedIn</a>}
              {profile.githubUrl && <a href={profile.githubUrl} target="_blank" rel="noreferrer" style={{ display:'block', padding:'7px 10px', background:'rgba(124,107,255,0.08)', borderRadius:'6px', color:'var(--accent2)', fontSize:'0.83rem', textDecoration:'none', marginBottom:'6px' }}>💻 GitHub</a>}
            </div>
          </div>
        </div>

        <div style={{ textAlign:'center', marginTop:'2rem', fontSize:'0.8rem', color:'var(--text3)' }}>
          <Link to="/home" style={{ color:'var(--accent2)' }}>⚡ Powered by InternHub</Link>
        </div>
      </div>
    </div>
  );
}
