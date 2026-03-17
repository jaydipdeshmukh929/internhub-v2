import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import InternshipCard from '../components/InternshipCard';
import { advancedSearch, getSavedInternships, getTrending } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['All','Technology','Marketing','Design','Finance','Operations','HR','Sales','Legal'];
const SORT_OPTIONS = [
  { value: 'newest',   label: '🕐 Newest First'       },
  { value: 'stipend',  label: '💰 Highest Stipend'     },
  { value: 'applied',  label: '🔥 Most Applied'        },
  { value: 'deadline', label: '⏳ Deadline (Soonest)'  },
  { value: 'views',    label: '👁 Most Viewed'         },
];

export default function Dashboard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const params = new URLSearchParams(location.search);

  const [internships, setInternships]   = useState([]);
  const [trending, setTrending]         = useState([]);
  const [savedIds, setSavedIds]         = useState([]);
  const [recentIds, setRecentIds]       = useState(() => {
    try { return JSON.parse(localStorage.getItem('recentViewed') || '[]'); } catch { return []; }
  });
  const [loading, setLoading]           = useState(true);
  const [showFilters, setShowFilters]   = useState(false);

  // Filter state
  const [keyword, setKeyword]           = useState(params.get('keyword') || '');
  const [locationF, setLocationF]       = useState('');
  const [category, setCategory]         = useState(params.get('category') || 'All');
  const [minStipend, setMinStipend]     = useState('');
  const [maxStipend, setMaxStipend]     = useState('');
  const [remote, setRemote]             = useState(false);
  const [partTime, setPartTime]         = useState(false);
  const [sortBy, setSortBy]             = useState('newest');
  const [activeTab, setActiveTab]       = useState('all'); // all | trending | recent

  useEffect(() => { loadSaved(); loadTrending(); }, []);
  useEffect(() => { doSearch(); }, [category, sortBy]);

  const loadSaved = async () => {
    try { const r = await getSavedInternships(user.email); setSavedIds(r.data.map(i => String(i.id))); }
    catch {}
  };

  const loadTrending = async () => {
    try { const r = await getTrending(); setTrending(r.data); } catch {}
  };

  const doSearch = useCallback(async () => {
    setLoading(true);
    try {
      const r = await advancedSearch({
        keyword:    keyword    || null,
        location:   locationF  || null,
        category:   category === 'All' ? null : category,
        minStipend: minStipend || null,
        maxStipend: maxStipend || null,
        remote:     remote     || null,
        type:       partTime   ? 'PART_TIME' : null,
        sortBy,
      });
      setInternships(r.data);
    } catch {}
    finally { setLoading(false); }
  }, [keyword, locationF, category, minStipend, maxStipend, remote, partTime, sortBy]);

  const handleBookmarkChange = id => {
    setSavedIds(prev => prev.includes(String(id)) ? prev.filter(x => x !== String(id)) : [...prev, String(id)]);
  };

  const resetFilters = () => {
    setKeyword(''); setLocationF(''); setMinStipend(''); setMaxStipend('');
    setRemote(false); setPartTime(false); setSortBy('newest'); setCategory('All');
  };

  // Recently viewed internships
  const recentInternships = recentIds
    .map(id => internships.find(i => String(i.id) === id) || trending.find(i => String(i.id) === id))
    .filter(Boolean)
    .slice(0, 4);

  const activeFiltersCount = [locationF, minStipend, maxStipend, remote, partTime]
    .filter(v => v && v !== false && v !== '').length;

  const displayInternships = activeTab === 'trending' ? trending
    : activeTab === 'recent' ? recentInternships
    : internships;

  return (
    <>
      <Navbar />
      <div className="page">
        {/* Header */}
        <div className="page-header">
          <h1 className="page-title">Explore Internships</h1>
          <div style={{ display:'flex', gap:'8px' }}>
            <select className="form-control" value={sortBy}
              onChange={e => setSortBy(e.target.value)} style={{ width:'auto', padding:'7px 12px' }}>
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <button className="btn btn-outline btn-sm"
              onClick={() => setShowFilters(!showFilters)}
              style={{ position:'relative', borderColor: activeFiltersCount > 0 ? 'var(--accent)' : '' }}>
              🎛 Filters {activeFiltersCount > 0 &&
                <span style={{ marginLeft:'4px', background:'var(--accent)', color:'white',
                  borderRadius:'10px', padding:'1px 6px', fontSize:'0.72rem' }}>{activeFiltersCount}</span>}
            </button>
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="card" style={{ marginBottom:'1.5rem', padding:'1.2rem' }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' }}>
              <div className="form-group" style={{ margin:0 }}>
                <label style={{ fontSize:'0.78rem' }}>🔍 Keyword</label>
                <input className="form-control" placeholder="Role or company..."
                  value={keyword} onChange={e => setKeyword(e.target.value)} style={{ padding:'8px 10px' }} />
              </div>
              <div className="form-group" style={{ margin:0 }}>
                <label style={{ fontSize:'0.78rem' }}>📍 Location</label>
                <input className="form-control" placeholder="City or state..."
                  value={locationF} onChange={e => setLocationF(e.target.value)} style={{ padding:'8px 10px' }} />
              </div>
              <div className="form-group" style={{ margin:0 }}>
                <label style={{ fontSize:'0.78rem' }}>💰 Min Stipend (₹)</label>
                <input className="form-control" type="number" placeholder="5000"
                  value={minStipend} onChange={e => setMinStipend(e.target.value)} style={{ padding:'8px 10px' }} />
              </div>
              <div className="form-group" style={{ margin:0 }}>
                <label style={{ fontSize:'0.78rem' }}>💰 Max Stipend (₹)</label>
                <input className="form-control" type="number" placeholder="50000"
                  value={maxStipend} onChange={e => setMaxStipend(e.target.value)} style={{ padding:'8px 10px' }} />
              </div>
            </div>

            {/* Stipend Range Slider */}
            <div style={{ margin:'1rem 0' }}>
              <label style={{ fontSize:'0.78rem', color:'var(--text2)' }}>
                💰 Stipend Range: ₹{Number(minStipend||0).toLocaleString()} – ₹{Number(maxStipend||100000).toLocaleString()}
              </label>
              <div style={{ display:'flex', gap:'12px', alignItems:'center', marginTop:'6px' }}>
                <span style={{ fontSize:'0.75rem', color:'var(--text3)' }}>₹0</span>
                <input type="range" min={0} max={100000} step={1000}
                  value={minStipend || 0}
                  onChange={e => setMinStipend(e.target.value)}
                  style={{ flex:1, accentColor:'var(--accent)' }} />
                <input type="range" min={0} max={100000} step={1000}
                  value={maxStipend || 100000}
                  onChange={e => setMaxStipend(e.target.value)}
                  style={{ flex:1, accentColor:'var(--accent2)' }} />
                <span style={{ fontSize:'0.75rem', color:'var(--text3)' }}>₹1L</span>
              </div>
            </div>

            {/* Checkboxes */}
            <div style={{ display:'flex', gap:'1.5rem', flexWrap:'wrap', marginBottom:'1rem' }}>
              <label style={{ display:'flex', gap:'8px', alignItems:'center', cursor:'pointer', fontSize:'0.88rem', color:'var(--text2)' }}>
                <input type="checkbox" checked={remote} onChange={e => setRemote(e.target.checked)}
                  style={{ accentColor:'var(--accent)' }} />
                🏠 Work From Home / Remote
              </label>
              <label style={{ display:'flex', gap:'8px', alignItems:'center', cursor:'pointer', fontSize:'0.88rem', color:'var(--text2)' }}>
                <input type="checkbox" checked={partTime} onChange={e => setPartTime(e.target.checked)}
                  style={{ accentColor:'var(--accent)' }} />
                ⏱ Part Time Only
              </label>
            </div>

            <div style={{ display:'flex', gap:'10px' }}>
              <button className="btn btn-primary btn-sm" onClick={doSearch}>Apply Filters</button>
              <button className="btn btn-outline btn-sm" onClick={resetFilters}>Reset All</button>
            </div>
          </div>
        )}

        {/* Category tabs */}
        <div style={{ display:'flex', gap:'6px', overflowX:'auto', paddingBottom:'6px', marginBottom:'1rem' }}>
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)} style={{
              whiteSpace:'nowrap', padding:'6px 16px', borderRadius:'20px', border:'1px solid',
              cursor:'pointer', fontSize:'0.83rem', fontWeight:500, transition:'all 0.2s',
              background: category===c ? 'var(--accent)' : 'var(--surface)',
              borderColor: category===c ? 'var(--accent)' : 'var(--border)',
              color: category===c ? 'white' : 'var(--text2)',
            }}>{c}</button>
          ))}
        </div>

        {/* View tabs */}
        <div className="tabs" style={{ marginBottom:'1.2rem' }}>
          {[
            { id:'all',      label:`All (${internships.length})`      },
            { id:'trending', label:`🔥 Trending (${trending.length})` },
            { id:'recent',   label:`👁 Recently Viewed (${recentInternships.length})` },
          ].map(t => (
            <button key={t.id} className={`tab-btn ${activeTab===t.id?'active':''}`}
              onClick={() => setActiveTab(t.id)}>{t.label}</button>
          ))}
        </div>

        {/* Results */}
        {loading && activeTab === 'all' ? (
          <div className="grid-3">{[...Array(6)].map((_,i) =>
            <div key={i} className="skeleton" style={{ height:'220px', borderRadius:'14px' }} />)}</div>
        ) : displayInternships.length === 0 ? (
          <div className="empty-state">
            <div className="icon">{activeTab==='trending'?'🔥':activeTab==='recent'?'👁':'🔎'}</div>
            <p>{activeTab==='recent' ? 'No recently viewed internships.' :
                activeTab==='trending' ? 'No trending internships yet.' :
                'No internships found. Try different filters.'}</p>
            {activeTab==='all' && activeFiltersCount > 0 &&
              <button className="btn btn-outline btn-sm" style={{ marginTop:'12px' }}
                onClick={resetFilters}>Clear Filters</button>}
          </div>
        ) : (
          <>
            {activeTab === 'all' && (
              <p style={{ color:'var(--text2)', fontSize:'0.83rem', marginBottom:'1rem' }}>
                {internships.length} internship{internships.length!==1?'s':''} found
                {activeFiltersCount > 0 && <span style={{ color:'var(--accent2)' }}> · {activeFiltersCount} filter{activeFiltersCount>1?'s':''} active</span>}
              </p>
            )}
            <div className="grid-3">
              {displayInternships.map(i => (
                <InternshipCard key={i.id} internship={i} savedIds={savedIds}
                  onBookmarkChange={handleBookmarkChange} />
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
