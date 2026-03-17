import React, { useState, useEffect } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
import Navbar from '../components/Navbar';
import { getStudentAnalytics } from '../services/api';
import { useAuth } from '../context/AuthContext';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const CHART_OPTS = {
  responsive: true,
  plugins: { legend: { labels: { color:'#9090b0', font:{ size:11 } } } },
  scales: {
    x: { ticks:{ color:'#9090b0' }, grid:{ color:'rgba(255,255,255,0.05)' } },
    y: { ticks:{ color:'#9090b0', stepSize:1 }, grid:{ color:'rgba(255,255,255,0.05)' }, beginAtZero:true },
  },
};

export default function StudentAnalytics() {
  const { user } = useAuth();
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getStudentAnalytics(user.email)
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user.email]);

  if (loading) return <><Navbar /><div className="page"><div className="skeleton" style={{ height:'400px', borderRadius:'14px' }} /></div></>;
  if (!data) return <><Navbar /><div className="page"><p style={{ color:'var(--text2)' }}>No data yet. Start applying!</p></div></>;

  const donutData = {
    labels: ['Pending','Accepted','Rejected','Shortlisted','Withdrawn'],
    datasets: [{
      data: [data.pending, data.accepted, data.rejected, data.shortlisted, data.withdrawn],
      backgroundColor: ['#3b82f6','#22c55e','#ef4444','#7c6bff','#5a5a7a'],
      borderWidth: 0,
    }],
  };

  const heatmapData = {
    labels: Object.keys(data.monthlyHeatmap || {}),
    datasets: [{
      label: 'Applications',
      data: Object.values(data.monthlyHeatmap || {}),
      backgroundColor: Object.values(data.monthlyHeatmap || {}).map(v =>
        v > 3 ? '#7c6bff' : v > 1 ? '#a78bfa' : v > 0 ? '#c4b5fd' : '#1a1a24'),
      borderRadius: 6,
    }],
  };

  const companyData = {
    labels: Object.keys(data.byCompany || {}),
    datasets: [{
      label: 'Applications',
      data: Object.values(data.byCompany || {}),
      backgroundColor: '#7c6bff',
      borderRadius: 6,
    }],
  };

  const statCards = [
    { label:'Total Applied',    value: data.total,           color:'var(--accent2)' },
    { label:'Accepted',         value: data.accepted,        color:'var(--green)'   },
    { label:'Rejected',         value: data.rejected,        color:'var(--red)'     },
    { label:'Shortlisted',      value: data.shortlisted,     color:'var(--amber)'   },
    { label:'Acceptance Rate',  value: data.acceptanceRate + '%', color:'var(--green)' },
    { label:'Response Rate',    value: data.responseRate + '%',   color:'var(--blue)'  },
  ];

  return (
    <>
      <Navbar />
      <div className="page">
        <h1 className="page-title">My Application Analytics</h1>

        {/* Stat cards */}
        <div className="stats-grid" style={{ marginBottom:'2rem' }}>
          {statCards.map(s => (
            <div key={s.label} className="stat-card">
              <div className="num" style={{ color:s.color, fontSize:'1.8rem' }}>{s.value}</div>
              <div className="lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {data.total === 0 ? (
          <div className="empty-state card">
            <div className="icon">📊</div>
            <p>No application data yet. Start applying to see your analytics!</p>
          </div>
        ) : (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
            {/* Status breakdown donut */}
            <div className="card">
              <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Application Status Breakdown</h3>
              <div style={{ maxHeight:'260px', display:'flex', justifyContent:'center' }}>
                <Doughnut data={donutData} options={{ responsive:true, plugins:{ legend:{ position:'right', labels:{ color:'#9090b0', font:{ size:11 } } } } }} />
              </div>
            </div>

            {/* Monthly heatmap */}
            <div className="card">
              <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>📅 Monthly Activity Heatmap</h3>
              <p style={{ fontSize:'0.78rem', color:'var(--text3)', marginBottom:'10px' }}>
                Darker bars = more applications that month
              </p>
              <Bar data={heatmapData} options={{ ...CHART_OPTS, plugins:{ ...CHART_OPTS.plugins, legend:{ display:false } } }} />
            </div>

            {/* Top companies */}
            {Object.keys(data.byCompany||{}).length > 0 && (
              <div className="card">
                <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>🏢 Applications by Company</h3>
                <Bar data={companyData} options={{ ...CHART_OPTS, indexAxis:'y', plugins:{ ...CHART_OPTS.plugins, legend:{ display:false } } }} />
              </div>
            )}

            {/* Tips */}
            <div className="card">
              <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>💡 Insights</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {data.acceptanceRate >= 50 && <div style={{ padding:'10px 12px', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:'8px', fontSize:'0.85rem', color:'var(--green)' }}>🏆 Excellent! Your acceptance rate is above 50%.</div>}
                {data.acceptanceRate > 0 && data.acceptanceRate < 20 && <div style={{ padding:'10px 12px', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'8px', fontSize:'0.85rem', color:'var(--amber)' }}>💡 Try improving your profile and cover letter to increase your acceptance rate.</div>}
                {data.total < 5 && <div style={{ padding:'10px 12px', background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:'8px', fontSize:'0.85rem', color:'var(--blue)' }}>🚀 Apply to more internships to increase your chances. Aim for at least 10!</div>}
                {data.responseRate >= 70 && <div style={{ padding:'10px 12px', background:'rgba(124,107,255,0.08)', border:'1px solid rgba(124,107,255,0.2)', borderRadius:'8px', fontSize:'0.85rem', color:'var(--accent2)' }}>⭐ Great response rate! Companies are reviewing your applications.</div>}
                {data.total >= 10 && <div style={{ padding:'10px 12px', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:'8px', fontSize:'0.85rem', color:'var(--green)' }}>🎯 You are very active! {data.total} applications submitted.</div>}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
