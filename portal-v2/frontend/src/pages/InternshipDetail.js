import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import InternshipCard from '../components/InternshipCard';
import { getInternshipById, applyToInternship, getCompanyReviews,
         addReview, toggleBookmark, getSavedInternships, getSimilar } from '../services/api';
import { useAuth } from '../context/AuthContext';

// getSimilar from api
const getSimilarApi = (id) => {
  const API = require('../services/api').default;
  return API.get(`/internships/similar/${id}`);
};

export default function InternshipDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [internship, setInternship]   = useState(null);
  const [similar, setSimilar]         = useState([]);
  const [reviews, setReviews]         = useState([]);
  const [avgRating, setAvgRating]     = useState(0);
  const [isSaved, setIsSaved]         = useState(false);
  const [savedIds, setSavedIds]       = useState([]);
  const [showApply, setShowApply]     = useState(false);
  const [showReview, setShowReview]   = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [review, setReview]           = useState({ rating:5, reviewTitle:'', reviewText:'', anonymous:false });
  const [msg, setMsg]                 = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(true);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
      try {
        const [iRes, saved, simRes] = await Promise.all([
          getInternshipById(id),
          getSavedInternships(user.email),
          getSimilarApi(id),
        ]);
        setInternship(iRes.data);
        const sIds = saved.data.map(i => String(i.id));
        setSavedIds(sIds);
        setIsSaved(sIds.includes(String(id)));
        setSimilar(simRes.data || []);
        loadReviews(iRes.data.companyName);
      } catch(e) {
        console.error(e); // ← change navigate to console.error
      }
      finally { setLoading(false); }
  };

  const loadReviews = async (company) => {
    try {
      const r = await getCompanyReviews(company);
      setReviews(r.data.reviews || []);
      setAvgRating(r.data.averageRating || 0);
    } catch {}
  };

  const handleApply = async () => {
    setError(''); setMsg('');
    try {
      const r = await applyToInternship({ studentEmail:user.email, studentName:user.name, internshipId:internship.id, coverLetter });
      if (r.data.success) { setMsg('✅ Application submitted!'); setShowApply(false); }
      else setError(r.data.message);
    } catch { setError('Application failed.'); }
  };

  const handleBookmark = async () => {
    await toggleBookmark({ email:user.email, internshipId:internship.id });
    setIsSaved(!isSaved);
  };

  const handleReview = async () => {
    try {
      const r = await addReview({ ...review, studentEmail:user.email, studentName:user.name, companyName:internship.companyName });
      if (r.data.success) { setShowReview(false); loadReviews(internship.companyName); }
      else setError(r.data.message);
    } catch {}
  };

  const stars = n => '★'.repeat(n) + '☆'.repeat(5-n);

  if (loading) return <><Navbar /><div className="page"><div className="skeleton" style={{ height:'400px', borderRadius:'14px' }} /></div></>;
  if (!internship) return null;

  return (
    <>
      <Navbar />
      <div className="page" style={{ maxWidth:'900px' }}>
        {msg   && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Header */}
        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'1rem' }}>
            <div style={{ display:'flex', gap:'1rem', alignItems:'flex-start' }}>
              <div className="company-logo" style={{ width:'60px', height:'60px', fontSize:'1.8rem', flexShrink:0 }}>
                {internship.companyName?.charAt(0)}
              </div>
              <div>
                <h1 style={{ fontSize:'1.5rem', marginBottom:'4px' }}>{internship.role}</h1>
                <div style={{ color:'var(--accent2)', fontWeight:'600', marginBottom:'8px' }}>{internship.companyName}</div>
                <div className="meta-row">
                  <span className="meta-chip">📍 {internship.remote?'Remote':internship.location}</span>
                  <span className="meta-chip amber">💰 ₹{internship.stipend?.toLocaleString()}/mo</span>
                  <span className="meta-chip">⏱ {internship.duration}</span>
                  {internship.openings && <span className="meta-chip green">👥 {internship.openings} openings</span>}
                  {internship.type && <span className="meta-chip purple">{internship.type.replace('_',' ')}</span>}
                  {internship.remote && <span className="meta-chip green">🏠 Remote</span>}
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px', flexWrap:'wrap' }}>
              <button className="btn btn-outline btn-sm" onClick={handleBookmark}>
                {isSaved ? '★ Saved' : '☆ Save'}
              </button>
              {user.role === 'STUDENT' && (
                <button className="btn btn-primary" onClick={() => setShowApply(true)}>Apply Now →</button>
              )}
            </div>
          </div>
          <div style={{ marginTop:'1.2rem', paddingTop:'1.2rem', borderTop:'1px solid var(--border)', display:'flex', gap:'2rem', flexWrap:'wrap' }}>
            <span style={{ fontSize:'0.83rem', color:'var(--text2)' }}>📝 <strong style={{ color:'var(--text)' }}>{internship.applicationCount||0}</strong> applicants</span>
            <span style={{ fontSize:'0.83rem', color:'var(--text2)' }}>👁 <strong style={{ color:'var(--text)' }}>{internship.viewCount||0}</strong> views</span>
            {internship.applyDeadline && (
              <span style={{ fontSize:'0.83rem', color:'var(--text2)' }}>⏳ Deadline: <strong style={{ color:'var(--text)' }}>{new Date(internship.applyDeadline).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</strong></span>
            )}
          </div>
        </div>

        {/* Details */}
        {internship.description && (
          <div className="card" style={{ marginBottom:'1rem' }}>
            <h3 style={{ marginBottom:'0.75rem' }}>About the Role</h3>
            <p style={{ color:'var(--text2)', lineHeight:'1.7', whiteSpace:'pre-wrap' }}>{internship.description}</p>
          </div>
        )}
        {internship.responsibilities && (
          <div className="card" style={{ marginBottom:'1rem' }}>
            <h3 style={{ marginBottom:'0.75rem' }}>Responsibilities</h3>
            <p style={{ color:'var(--text2)', lineHeight:'1.7', whiteSpace:'pre-wrap' }}>{internship.responsibilities}</p>
          </div>
        )}
        {internship.requirements && (
          <div className="card" style={{ marginBottom:'1rem' }}>
            <h3 style={{ marginBottom:'0.75rem' }}>Requirements</h3>
            <p style={{ color:'var(--text2)', lineHeight:'1.7', whiteSpace:'pre-wrap' }}>{internship.requirements}</p>
          </div>
        )}
        {internship.skillsRequired && (
          <div className="card" style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ marginBottom:'0.75rem' }}>Skills Required</h3>
            {internship.skillsRequired.split(',').map((s,i) => <span key={i} className="tag">{s.trim()}</span>)}
          </div>
        )}

        {/* Reviews */}
        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <div>
              <h3>Company Reviews</h3>
              {avgRating > 0 && (
                <div style={{ marginTop:'4px' }}>
                  <span className="stars">{stars(Math.round(avgRating))}</span>
                  <span style={{ color:'var(--text2)', fontSize:'0.85rem', marginLeft:'8px' }}>{avgRating}/5 ({reviews.length})</span>
                </div>
              )}
            </div>
            {user.role === 'STUDENT' && (
              <button className="btn btn-outline btn-sm" onClick={() => setShowReview(true)}>+ Write Review</button>
            )}
          </div>
          {reviews.length === 0 ? <p style={{ color:'var(--text3)', fontSize:'0.88rem' }}>No reviews yet.</p>
          : reviews.map(r => (
            <div key={r.id} style={{ padding:'12px 0', borderBottom:'1px solid var(--border)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'4px' }}>
                <span className="stars" style={{ fontSize:'0.9rem' }}>{stars(r.rating)}</span>
                <span style={{ fontSize:'0.78rem', color:'var(--text3)' }}>{r.anonymous?'Anonymous':r.studentName}</span>
              </div>
              <div style={{ fontWeight:'600', fontSize:'0.9rem', marginBottom:'4px' }}>{r.reviewTitle}</div>
              <div style={{ fontSize:'0.85rem', color:'var(--text2)' }}>{r.reviewText}</div>
            </div>
          ))}
        </div>

        {/* Similar Internships */}
        {similar.length > 0 && (
          <div style={{ marginBottom:'1.5rem' }}>
            <h3 style={{ marginBottom:'1rem', fontSize:'1.1rem', fontFamily:'Syne,sans-serif' }}>
              Similar Internships
            </h3>
            <div className="grid-2">
              {similar.map(i => (
                <InternshipCard key={i.id} internship={i} savedIds={savedIds}
                  onBookmarkChange={id => setSavedIds(prev =>
                    prev.includes(String(id)) ? prev.filter(x=>x!==String(id)) : [...prev,String(id)])} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Apply Modal */}
      {showApply && (
        <div className="modal-overlay" onClick={() => setShowApply(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Apply for {internship.role}</h3>
              <button className="modal-close" onClick={() => setShowApply(false)}>×</button>
            </div>
            <p style={{ color:'var(--text2)', fontSize:'0.88rem', marginBottom:'1rem' }}>
              Applying to <strong>{internship.companyName}</strong> as <strong>{user.name}</strong>
            </p>
            <div className="form-group">
              <label>Cover Letter (optional)</label>
              <textarea className="form-control" rows={5} placeholder="Why are you the perfect fit?"
                value={coverLetter} onChange={e => setCoverLetter(e.target.value)} />
            </div>
            {error && <div className="alert alert-error">{error}</div>}
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowApply(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleApply}>Submit Application</button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReview && (
        <div className="modal-overlay" onClick={() => setShowReview(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Review {internship.companyName}</h3>
              <button className="modal-close" onClick={() => setShowReview(false)}>×</button>
            </div>
            <div className="form-group">
              <label>Rating</label>
              <select className="form-control" value={review.rating}
                onChange={e => setReview({...review, rating:Number(e.target.value)})}>
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{stars(n)} ({n}/5)</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Review Title</label>
              <input className="form-control" placeholder="Great learning experience"
                value={review.reviewTitle} onChange={e => setReview({...review, reviewTitle:e.target.value})} />
            </div>
            <div className="form-group">
              <label>Your Review</label>
              <textarea className="form-control" rows={4} placeholder="Share your honest experience..."
                value={review.reviewText} onChange={e => setReview({...review, reviewText:e.target.value})} />
            </div>
            <label style={{ display:'flex', gap:'8px', alignItems:'center', color:'var(--text2)', fontSize:'0.88rem', cursor:'pointer' }}>
              <input type="checkbox" checked={review.anonymous} onChange={e => setReview({...review, anonymous:e.target.checked})} />
              Post anonymously
            </label>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setShowReview(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleReview}>Submit Review</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
