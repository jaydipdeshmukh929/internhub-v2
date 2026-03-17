import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getLatest } from '../services/api';

const CATEGORIES = ['Technology','Marketing','Design','Finance','Operations','HR','Sales','Legal'];

export default function Home() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');
  const [latest, setLatest] = useState([]);

  useEffect(() => {
    getLatest().then(r => setLatest(r.data)).catch(() => {});
  }, []);

  const search = (e) => {
    e.preventDefault();
    navigate(`/dashboard?keyword=${encodeURIComponent(keyword)}`);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      {/* Nav */}
      <nav className="navbar">
        <span className="brand">⚡ InternHub</span>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/login" className="btn btn-outline btn-sm">Sign In</Link>
          <Link to="/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div className="hero">
        <div style={{ display: 'inline-block', background: 'rgba(124,107,255,0.1)', border: '1px solid rgba(124,107,255,0.3)', borderRadius: '20px', padding: '4px 16px', fontSize: '0.82rem', color: 'var(--accent2)', marginBottom: '1.5rem' }}>
          🚀 #1 Platform for Student Internships
        </div>
        <h1>Launch Your Career<br />With the Right Internship</h1>
        <p>Discover thousands of internships from top companies. Apply in seconds, track your progress, and land your dream role.</p>

        <form className="hero-search" onSubmit={search}>
          <input
            placeholder="Search by role, company or skill…"
            value={keyword}
            onChange={e => setKeyword(e.target.value)}
          />
          <button className="btn btn-primary" type="submit">Search →</button>
        </form>

        <div className="category-pills">
          {CATEGORIES.map(c => (
            <span key={c} className="category-pill"
              onClick={() => navigate(`/dashboard?category=${c}`)}>
              {c}
            </span>
          ))}
        </div>
      </div>

      {/* Stats strip */}
      <div style={{ maxWidth: '900px', margin: '0 auto 4rem', padding: '0 2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '1rem' }}>
          {[
            { num: '10,000+', label: 'Active Internships' },
            { num: '5,000+', label: 'Companies Hiring' },
            { num: '50,000+', label: 'Students Placed' },
            { num: '98%', label: 'Satisfaction Rate' },
          ].map(s => (
            <div key={s.label} className="stat-card" style={{ textAlign: 'center' }}>
              <div className="num">{s.num}</div>
              <div className="lbl">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Latest internships */}
      {latest.length > 0 && (
        <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 2rem 4rem' }}>
          <h2 style={{ marginBottom: '1.5rem', fontFamily: 'Syne,sans-serif' }}>
            Latest Opportunities
          </h2>
          <div className="grid-3">
            {latest.map(i => (
              <div key={i.id} className="intern-card card-hover"
                onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
                <div className="company-logo">{i.companyName?.charAt(0)}</div>
                <div className="company-name">{i.companyName}</div>
                <h3>{i.role}</h3>
                <div className="meta-row" style={{ marginTop: '8px' }}>
                  <span className="meta-chip">📍 {i.remote ? 'Remote' : i.location}</span>
                  <span className="meta-chip amber">💰 ₹{i.stipend?.toLocaleString()}/mo</span>
                </div>
              </div>
            ))}
          </div>
          <div style={{ textAlign: 'center', marginTop: '2rem' }}>
            <Link to="/register" className="btn btn-primary">View All Internships →</Link>
          </div>
        </div>
      )}

      {/* Features */}
      <div style={{ background: 'var(--surface)', borderTop: '1px solid var(--border)', padding: '4rem 2rem' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', marginBottom: '2.5rem', fontFamily: 'Syne,sans-serif', fontSize: '2rem' }}>
            Why Students Choose InternHub
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1.5rem' }}>
            {[
              { icon: '🔍', title: 'Smart Search', desc: 'Filter by location, stipend, category, and remote options.' },
              { icon: '⭐', title: 'Save & Track', desc: 'Bookmark internships and track all your applications in one place.' },
              { icon: '📧', title: 'Email Alerts', desc: 'Get instant email updates when your application status changes.' },
              { icon: '📅', title: 'Interview Scheduling', desc: 'Admins can schedule interviews directly through the portal.' },
              { icon: '💬', title: 'Company Reviews', desc: 'Read real reviews from past interns before you apply.' },
              { icon: '📊', title: 'Analytics', desc: 'Admins get full analytics on applications, users, and trends.' },
            ].map(f => (
              <div key={f.title} className="card" style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{f.icon}</div>
                <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text2)' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text3)', fontSize: '0.82rem', borderTop: '1px solid var(--border)' }}>
        © 2025 InternHub — Built with Spring Boot & React
      </div>
    </div>
  );
}
