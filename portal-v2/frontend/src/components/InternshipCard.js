import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toggleBookmark } from '../services/api';

export default function InternshipCard({ internship, savedIds = [], onBookmarkChange }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isSaved = savedIds.includes(String(internship.id));

  const daysLeft = () => {
    if (!internship.applyDeadline) return null;
    const diff = Math.ceil((new Date(internship.applyDeadline) - new Date()) / (1000*60*60*24));
    return diff;
  };
  const days = daysLeft();

  const handleClick = () => {
    // Track recently viewed
    try {
      const recent = JSON.parse(localStorage.getItem('recentViewed') || '[]');
      const updated = [String(internship.id), ...recent.filter(x => x !== String(internship.id))].slice(0, 10);
      localStorage.setItem('recentViewed', JSON.stringify(updated));
    } catch {}
    navigate(`/internship/${internship.id}`);
  };

  const handleBookmark = async (e) => {
    e.stopPropagation();
    if (!user) return;
    try {
      await toggleBookmark({ email: user.email, internshipId: internship.id });
      if (onBookmarkChange) onBookmarkChange(internship.id);
    } catch {}
  };

  return (
    <div className="intern-card card-hover" onClick={handleClick} style={{ cursor:'pointer' }}>
      <div className="company-logo">{internship.companyName?.charAt(0) || '🏢'}</div>
      <div className="company-name">{internship.companyName}</div>
      <h3>{internship.role}</h3>

      <div className="meta-row" style={{ marginTop:'8px' }}>
        <span className="meta-chip">📍 {internship.remote ? 'Remote' : internship.location}</span>
        <span className="meta-chip amber">💰 ₹{internship.stipend?.toLocaleString()}/mo</span>
        <span className="meta-chip">⏱ {internship.duration}</span>
        {internship.category && <span className="meta-chip purple">{internship.category}</span>}
        {internship.remote && <span className="meta-chip green">🏠 Remote</span>}
        {internship.type === 'PART_TIME' && <span className="meta-chip" style={{ background:'rgba(59,130,246,0.1)', borderColor:'rgba(59,130,246,0.2)', color:'var(--blue)' }}>Part Time</span>}
      </div>

      {internship.skillsRequired && (
        <div style={{ marginTop:'8px', display:'flex', flexWrap:'wrap', gap:'4px' }}>
          {internship.skillsRequired.split(',').slice(0,3).map((s,i) => (
            <span key={i} className="tag" style={{ fontSize:'0.72rem', padding:'2px 8px' }}>{s.trim()}</span>
          ))}
        </div>
      )}

      <div className="card-footer">
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          <span style={{ fontSize:'0.76rem', color:'var(--text3)' }}>👁 {internship.viewCount||0}</span>
          <span style={{ fontSize:'0.76rem', color:'var(--text3)' }}>📝 {internship.applicationCount||0}</span>
        </div>
        <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
          {days !== null && (
            <span className={`deadline-chip ${days<=3?'urgent':''}`}>
              {days<=0 ? 'Closed' : `${days}d left`}
            </span>
          )}
          {user?.role === 'STUDENT' && (
            <button className={`bookmark-btn ${isSaved?'saved':''}`} onClick={handleBookmark}>
              {isSaved ? '★' : '☆'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
