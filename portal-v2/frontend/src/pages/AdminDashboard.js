import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement,
         LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import Navbar from '../components/Navbar';
import { getAdminAnalytics } from '../services/api';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend, Filler);

const OPTS = {
  responsive: true,
  plugins: { legend: { labels: { color:'#9090b0', font:{ size:11 } } } },
  scales: {
    x: { ticks:{ color:'#9090b0' }, grid:{ color:'rgba(255,255,255,0.05)' } },
    y: { ticks:{ color:'#9090b0', stepSize:1 }, grid:{ color:'rgba(255,255,255,0.05)' }, beginAtZero:true },
  },
};

export default function AdminDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [heatmapView, setHeatmapView] = useState('monthly');

  useEffect(() => {
    getAdminAnalytics()
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <><Navbar /><div className="page"><div className="skeleton" style={{ height:'400px', borderRadius:'14px' }} /></div></>;
  if (!data) return <><Navbar /><div className="page"><p>No data available.</p></div></>;

  // Applications per day line chart
  const dailyLabels  = Object.keys(data.applicationsPerDay || {}).reverse().slice(-14);
  const dailyValues  = Object.values(data.applicationsPerDay || {}).reverse().slice(-14);
  const lineData = {
    labels: dailyLabels,
    datasets: [{
      label: 'Applications per Day',
      data: dailyValues,
      borderColor: '#7c6bff',
      backgroundColor: 'rgba(124,107,255,0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#7c6bff',
      pointRadius: 4,
    }],
  };

  // Monthly heatmap
  const monthlyData = {
    labels: Object.keys(data.monthlyHeatmap || {}),
    datasets: [{
      label: 'Applications',
      data: Object.values(data.monthlyHeatmap || {}),
      backgroundColor: Object.values(data.monthlyHeatmap || {}).map(v =>
        v > 10 ? '#7c6bff' : v > 5 ? '#a78bfa' : v > 0 ? '#c4b5fd' : '#1a1a24'),
      borderRadius: 6,
    }],
  };

  // Status donut
  const donutData = {
    labels: ['Applied','Shortlisted','Interview','Accepted','Rejected'],
    datasets: [{
      data: [data.applied, data.shortlisted, data.interview, data.accepted, data.rejected],
      backgroundColor: ['#3b82f6','#7c6bff','#ec4899','#22c55e','#ef4444'],
      borderWidth: 0,
    }],
  };

  // Company wise bar
  const companyLabels = Object.keys(data.companyWise || {});
  const companyVals   = Object.values(data.companyWise || {});
  const companyBar = {
    labels: companyLabels,
    datasets: [{
      label: 'Applications',
      data: companyVals,
      backgroundColor: ['#7c6bff','#22c55e','#ef4444','#f59e0b','#3b82f6','#ec4899','#14b8a6','#8b5cf6','#f97316','#06b6d4'],
      borderRadius: 6,
    }],
  };

  // Category wise
  const catLabels = Object.keys(data.categoryWise || {});
  const catVals   = Object.values(data.categoryWise || {});
  const catData = {
    labels: catLabels,
    datasets: [{
      label: 'Internships',
      data: catVals,
      backgroundColor: '#22c55e',
      borderRadius: 6,
    }],
  };

  const statCards = [
    { label:'Total Users',     value:data.totalUsers,        color:'var(--accent2)' },
    { label:'Students',        value:data.totalStudents,     color:'var(--blue)'    },
    { label:'Internships',     value:data.totalInternships,  color:'var(--green)'   },
    { label:'Applications',    value:data.totalApplications, color:'var(--amber)'   },
    { label:'Accepted',        value:data.accepted,          color:'var(--green)'   },
    { label:'Rejected',        value:data.rejected,          color:'var(--red)'     },
  ];

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <Link to="/admin/internships" className="btn btn-primary btn-sm">+ Add Internship</Link>
        </div>

        {/* Stats */}
        <div className="stats-grid" style={{ marginBottom:'2rem' }}>
          {statCards.map(s => (
            <div key={s.label} className="stat-card">
              <div className="num" style={{ color:s.color }}>{s.value||0}</div>
              <div className="lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Row 1 — Line chart + Donut */}
        <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr', gap:'1.5rem', marginBottom:'1.5rem' }}>
          <div className="card">
            <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>📈 Applications per Day (Last 14 days)</h3>
            <Line data={lineData} options={{ ...OPTS, plugins:{ ...OPTS.plugins, legend:{ display:false } } }} />
          </div>
          <div className="card">
            <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Status Breakdown</h3>
            <Doughnut data={donutData} options={{ responsive:true, plugins:{ legend:{ position:'bottom', labels:{ color:'#9090b0', font:{ size:10 } } } } }} />
          </div>
        </div>

        {/* Row 2 — Monthly heatmap */}
        <div className="card" style={{ marginBottom:'1.5rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1rem' }}>
            <h3 style={{ fontSize:'1rem' }}>📅 Application Heatmap — Which months are most active?</h3>
          </div>
          <p style={{ fontSize:'0.78rem', color:'var(--text3)', marginBottom:'10px' }}>Darker bars = more applications that month</p>
          <Bar data={monthlyData} options={{ ...OPTS, plugins:{ ...OPTS.plugins, legend:{ display:false } } }} />
        </div>

        {/* Row 3 — Company-wise + Category-wise */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem', marginBottom:'1.5rem' }}>
          <div className="card">
            <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>🏢 Company-wise Applications (Top 10)</h3>
            {companyLabels.length === 0
              ? <p style={{ color:'var(--text3)', fontSize:'0.88rem' }}>No application data yet.</p>
              : <Bar data={companyBar} options={{ ...OPTS, indexAxis:'y', plugins:{ ...OPTS.plugins, legend:{ display:false } } }} />
            }
          </div>
          <div className="card">
            <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>📂 Internships by Category</h3>
            {catLabels.length === 0
              ? <p style={{ color:'var(--text3)', fontSize:'0.88rem' }}>No internships yet.</p>
              : <Bar data={catData} options={{ ...OPTS, plugins:{ ...OPTS.plugins, legend:{ display:false } } }} />
            }
          </div>
        </div>

        {/* Quick links */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:'1rem' }}>
          {[
            { label:'Manage Internships', desc:`${data.totalInternships||0} listings`, link:'/admin/internships', icon:'💼' },
            { label:'Review Applications', desc:`${data.totalApplications||0} applications`, link:'/admin/applications', icon:'📋' },
            { label:'Manage Users', desc:`${data.totalStudents||0} students`, link:'/admin/users', icon:'👥' },
            { label:'Admin Features', desc:'Import, Export, Templates', link:'/admin/features', icon:'⚡' },
          ].map(q => (
            <Link key={q.label} to={q.link} className="card card-hover" style={{ display:'block' }}>
              <div style={{ fontSize:'1.8rem', marginBottom:'8px' }}>{q.icon}</div>
              <h3 style={{ fontSize:'1rem', marginBottom:'4px' }}>{q.label}</h3>
              <p style={{ fontSize:'0.82rem', color:'var(--text2)' }}>{q.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
