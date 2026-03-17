import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import InternshipCard from '../components/InternshipCard';
import { getSavedInternships } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function SavedInternships() {
  const { user } = useAuth();
  const [saved, setSaved] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const r = await getSavedInternships(user.email);
      setSaved(r.data);
      setSavedIds(r.data.map(i => String(i.id)));
    } catch {}
    finally { setLoading(false); }
  };

  const handleBookmarkChange = (id) => {
    setSaved(prev => prev.filter(i => String(i.id) !== String(id)));
    setSavedIds(prev => prev.filter(x => x !== String(id)));
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Saved Internships</h1>
          <span style={{ color: 'var(--text2)', fontSize: '0.88rem' }}>{saved.length} saved</span>
        </div>
        {loading ? (
          <div className="grid-3">{[...Array(3)].map((_, i) => <div key={i} className="skeleton" style={{ height: '220px', borderRadius: '14px' }} />)}</div>
        ) : saved.length === 0 ? (
          <div className="empty-state">
            <div className="icon">★</div>
            <p>No saved internships yet. Star any listing to save it here.</p>
          </div>
        ) : (
          <div className="grid-3">
            {saved.map(i => (
              <InternshipCard key={i.id} internship={i} savedIds={savedIds} onBookmarkChange={handleBookmarkChange} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
