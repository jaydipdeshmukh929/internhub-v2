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
  getSimilar   // ✅ use this directly
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
  const [review, setReview]           = useState({ rating:5, reviewTitle:'', reviewText:'', anonymous:false });
  const [msg, setMsg]                 = useState('');
  const [error, setError]             = useState('');
  const [loading, setLoading]         = useState(true);

  useEffect(() => { loadData(); }, [id]);

  // ✅ FIXED loadData (uses getSimilar directly)
  const loadData = async () => {
    try {
      const [iRes, saved, simRes] = await Promise.all([
        getInternshipById(id),
        getSavedInternships(user.email),
        getSimilar(id),   // ✅ FIXED HERE
      ]);

      setInternship(iRes.data);

      const sIds = saved.data.map(i => String(i.id));
      setSavedIds(sIds);
      setIsSaved(sIds.includes(String(id)));

      setSimilar(simRes.data || []);
      loadReviews(iRes.data.companyName);

    } catch(e) {
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
    setError('');
    setMsg('');

    try {
      console.log("Sending data:", {
        studentEmail: user.email,
        studentName: user.name,
        internshipId: internship.id,
        coverLetter
      });

      const r = await applyToInternship({
        studentEmail: user.email,
        studentName: user.name,
        internshipId: internship.id,
        coverLetter
      });

      console.log("Response:", r.data);

      if (r.data.success) {
        setMsg('✅ Application submitted!');
        setShowApply(false);
      } else {
        setError(r.data.message);
      }
    } catch (e) {
      console.error("Apply error:", e);
      setError('Application failed.');
    }
  };

  const handleBookmark = async () => {
    await toggleBookmark({ email:user.email, internshipId:internship.id });
    setIsSaved(!isSaved);
  };

  const handleReview = async () => {
    try {
      const r = await addReview({
        ...review,
        studentEmail:user.email,
        studentName:user.name,
        companyName:internship.companyName
      });

      if (r.data.success) {
        setShowReview(false);
        loadReviews(internship.companyName);
      } else setError(r.data.message);

    } catch {}
  };

  const stars = n => '★'.repeat(n) + '☆'.repeat(5-n);

  if (loading) return (
    <>
      <Navbar />
      <div className="page">
        <div className="skeleton" style={{ height:'400px', borderRadius:'14px' }} />
      </div>
    </>
  );

  if (!internship) return null;

  return (
    <>
      <Navbar />
      <div className="page" style={{ maxWidth:'900px' }}>
        {msg && <div className="alert alert-success">{msg}</div>}
        {error && <div className="alert alert-error">{error}</div>}

        {/* Header */}
        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
            <div>
              <h1>{internship.role}</h1>
              <div>{internship.companyName}</div>
            </div>

            <div>
              <button onClick={handleBookmark}>
                {isSaved ? '★ Saved' : '☆ Save'}
              </button>

              {user.role === 'STUDENT' && (
                <button
                  className="btn btn-primary"
                  style={{ zIndex: 10, position: "relative", cursor: "pointer" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowApply(true);
                  }}
                >
                  Apply Now →
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Similar Internships */}
        {similar.length > 0 && (
          <div>
            <h3>Similar Internships</h3>
            {similar.map(i => (
              <InternshipCard key={i.id} internship={i} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}