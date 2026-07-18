import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import InternshipCard from '../components/InternshipCard';
import {
  getInternshipById,
  applyToInternship,
  getCompanyReviews,
  addReview,
  toggleBookmark,
  getSavedInternships,
  getSimilar
} from '../services/api';
import { useAuth } from '../context/AuthContext';

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
  const [review, setReview]           = useState({ rating: 5, reviewTitle: '', reviewText: '', anonymous: false });
  const [msg, setMsg]                 = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(true);
  const [applying, setApplying]       = useState(false);

  useEffect(() => { loadData(); }, [id]);

  const loadData = async () => {
    try {
      const [iRes, saved, simRes] = await Promise.all([
        getInternshipById(id),
        getSavedInternships(user.email),
        getSimilar(id),
      ]);
      setInternship(iRes.data);
      const sIds = saved.data.map(i => String(i.id));
      setSavedIds(sIds);
      setIsSaved(sIds.includes(String(id)));
      setSimilar(simRes.data || []);
      loadReviews(iRes.data.companyName);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadReviews = async (company) => {
    try {
      const r = await getCompanyReviews(company);
      setReviews(r.data.reviews || []);
      setAvgRating(r.data.averageRating || 0);
    } catch {}
  };

  const handleApply = async () => {
    setError(''); setMsg(''); setApplying(true);
    try {
      const r = await applyToInternship({
        studentEmail: user.email,
        studentName:  user.name,
        internshipId: internship.id,
        coverLetter
      });
      if (r.data.success) {
        setMsg('✅ Application submitted successfully!');
        setShowApply(false);
        setCoverLetter('');
      } else {
        setError(r.data.message);
      }
    } catch (e) {
      console.error('Apply error:', e);
      setError('Application failed. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  const handleBookmark = async () => {
    await toggleBookmark({ email: user.email, internshipId: internship.id });
    setIsSaved(!isSaved);
  };

  const handleReview = async () => {
    try {
      const r = await addReview({
        ...review,
        studentEmail: user.email,
        studentName:  user.name,
        companyName:  internship.companyName
      });
      if (r.data.success) { setShowReview(false); loadReviews(internship.companyName); }
      else setError(r.data.message);
    } catch {}
  };

  const stars = n => '★'.repeat(n) + '☆'.repeat(5 - n);

  if (loading) return (
    <>
      <Navbar />
      <div className="page">
        <div className="skeleton" style={{ height: '400px', borderRadius: '14px' }} />
      </div>
    </>
  );

  if (!internship) return null;

  return (
    <>
      <Navbar />
      <div className="page" style={{ maxWidth: '900px' }}>
        {msg   && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Header Card */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h1 style={{ fontSize: '1.5rem' }}>{internship.role}</h1>
              <div style={{ color: 'var(--accent2)', fontWeight: '600' }}>{internship.companyName}</div>
              {internship.location && <div style={{ color: 'var(--text2)', fontSize: '0.85rem', marginTop: '4px' }}>📍 {internship.location}</div>}
              {internship.stipend  && <div style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>💰 {internship.stipend}</div>}
              {internship.duration && <div style={{ color: 'var(--text2)', fontSize: '0.85rem' }}>⏱ {internship.duration}</div>}
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-outline btn-sm" onClick={handleBookmark}>
                {isSaved ? '★ Saved' : '☆ Save'}
              </button>
              {user?.role === 'STUDENT' && (
                <button className="btn btn-primary" onClick={() => { setShowApply(true); setMsg(''); setError(''); }}>
                  Apply Now →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        {internship.description && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>About the Role</h3>
            <p style={{ color: 'var(--text2)', lineHeight: '1.7', whiteSpace: 'pre-wrap' }}>{internship.description}</p>
          </div>
        )}

        {/* Skills */}
        {internship.skills && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>Skills Required</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {internship.skills.split(',').map(s => (
                <span key={s} style={{
                  background: 'var(--surface2)', padding: '4px 12px',
                  borderRadius: '20px', fontSize: '0.82rem', color: 'var(--text2)'
                }}>{s.trim()}</span>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>Reviews ({reviews.length}) — Avg: {avgRating.toFixed(1)} ★</h3>
            {reviews.map((r, i) => (
              <div key={i} style={{ borderBottom: '1px solid var(--border)', paddingBottom: '10px', marginBottom: '10px' }}>
                <div style={{ fontWeight: 600 }}>{stars(r.rating)} {r.reviewTitle}</div>
                <div style={{ fontSize: '0.83rem', color: 'var(--text2)' }}>{r.reviewText}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>— {r.anonymous ? 'Anonymous' : r.studentName}</div>
              </div>
            ))}
          </div>
        )}

        {user?.role === 'STUDENT' && (
          <button className="btn btn-outline btn-sm" onClick={() => setShowReview(true)} style={{ marginBottom: '1.5rem' }}>
            + Write a Review
          </button>
        )}

        {/* Similar Internships */}
        {similar.length > 0 && (
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Similar Internships</h3>
            {similar.map(i => <InternshipCard key={i.id} internship={i} />)}
          </div>
        )}
      </div>

      {/* ── Apply Modal ─────────────────────────────────────────────────────── */}
      {showApply && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '0.5rem' }}>Apply for {internship.role}</h3>
            <p style={{ color: 'var(--text2)', fontSize: '0.85rem', marginBottom: '1.2rem' }}>
              {internship.companyName}
            </p>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label>Cover Letter <span style={{ color: 'var(--text3)', fontWeight: 400 }}>(optional)</span></label>
              <textarea
                className="form-control"
                rows={5}
                placeholder="Tell us why you're a great fit for this role..."
                value={coverLetter}
                onChange={e => setCoverLetter(e.target.value)}
                style={{ fontSize: '0.85rem', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem' }}>
              <button
                className="btn btn-primary"
                onClick={handleApply}
                disabled={applying}
                style={{ flex: 1 }}
              >
                {applying ? 'Submitting…' : '🚀 Submit Application'}
              </button>
              <button
                className="btn btn-outline"
                onClick={() => { setShowApply(false); setError(''); }}
                style={{ flex: 1 }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Review Modal ─────────────────────────────────────────────────────── */}
      {showReview && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '1rem'
        }}>
          <div className="card" style={{ width: '100%', maxWidth: '480px' }}>
            <h3 style={{ marginBottom: '1rem' }}>Review {internship.companyName}</h3>

            <div className="form-group">
              <label>Rating</label>
              <select className="form-control" value={review.rating}
                onChange={e => setReview({ ...review, rating: Number(e.target.value) })}>
                {[5,4,3,2,1].map(n => <option key={n} value={n}>{stars(n)} ({n}/5)</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Title</label>
              <input className="form-control" value={review.reviewTitle}
                onChange={e => setReview({ ...review, reviewTitle: e.target.value })}
                placeholder="Great internship experience!" />
            </div>
            <div className="form-group">
              <label>Review</label>
              <textarea className="form-control" rows={3} value={review.reviewText}
                onChange={e => setReview({ ...review, reviewText: e.target.value })}
                placeholder="Share your experience..." />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', marginBottom: '1rem' }}>
              <input type="checkbox" checked={review.anonymous}
                onChange={e => setReview({ ...review, anonymous: e.target.checked })} />
              Post anonymously
            </label>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" onClick={handleReview} style={{ flex: 1 }}>Submit Review</button>
              <button className="btn btn-outline" onClick={() => setShowReview(false)} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
