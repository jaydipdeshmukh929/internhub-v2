import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, CategoryScale, LinearScale,
  BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler
} from 'chart.js';
import Navbar from '../components/Navbar';
import { getAdminAnalytics } from '../services/api';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, Title, Tooltip, Legend, Filler);

const OPTS = {
  responsive: true,
  maintainAspectRatio: true,
  plugins: { legend: { labels: { color: '#9090b0', font: { size: 11 } } } },
  scales: {
    x: { ticks: { color: '#9090b0' }, grid: { color: 'rgba(255,255,255,0.05)' } },
    y: { ticks: { color: '#9090b0', stepSize: 1 }, grid: { color: 'rgba(255,255,255,0.05)' }, beginAtZero: true },
  },
};

const OPTS_H = { ...OPTS, indexAxis: 'y', scales: { ...OPTS.scales, y: { ticks: { color: '#9090b0' }, grid: { color: 'rgba(255,255,255,0.05)' } }, x: { ...OPTS.scales.x, beginAtZero: true } } };

export default function AdminDashboard() {
  const [data, setData]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    getAdminAnalytics()
      .then(r => { setData(r.data); })
      .catch(e => setError('Failed to load analytics: ' + (e.response?.data?.message || e.message)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <>
      <Navbar />
      <div className="page">
        <h1 className="page-title">Admin Dashboard</h1>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1rem', marginBottom: '2rem' }}>
          {[...Array(6)].map((_, i) => <div key={i} className="skeleton" style={{ height: '90px', borderRadius: '12px' }} />)}
        </div>
        <div className="skeleton" style={{ height: '280px', borderRadius: '14px' }} />
      </div>
    </>
  );

  if (error) return (
    <>
      <Navbar />
      <div className="page">
        <h1 className="page-title">Admin Dashboard</h1>
        <div className="alert alert-error">{error}</div>
        <p style={{ color: 'var(--text2)', fontSize: '0.88rem' }}>
          Make sure the backend is running on port 8081 and you are logged in as Admin.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          {[
            { label: 'Manage Internships', link: '/admin/internships', icon: '💼' },
            { label: 'Review Applications', link: '/admin/applications', icon: '📋' },
            { label: 'Manage Users',        link: '/admin/users',        icon: '👥' },
            { label: 'Admin Features',      link: '/admin/features',     icon: '⚡' },
          ].map(q => (
            <Link key={q.label} to={q.link} className="card card-hover" style={{ display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{q.icon}</div>
              <h3 style={{ fontSize: '1rem' }}>{q.label}</h3>
            </Link>
          ))}
        </div>
      </div>
    </>
  );

  const d = data || {};

  // Safe data builders
  const dailyLabels  = Object.keys(d.applicationsPerDay  || {});
  const dailyValues  = Object.values(d.applicationsPerDay || {});
  const monthLabels  = Object.keys(d.monthlyHeatmap      || {});
  const monthValues  = Object.values(d.monthlyHeatmap    || {});
  const companyLabels= Object.keys(d.companyWise         || {}).slice(0, 10);
  const companyValues= Object.values(d.companyWise       || {}).slice(0, 10);
  const catLabels    = Object.keys(d.categoryWise        || {});
  const catValues    = Object.values(d.categoryWise      || {});

  const lineData = {
    labels: dailyLabels.length ? dailyLabels : ['No data'],
    datasets: [{
      label: 'Applications',
      data: dailyValues.length ? dailyValues : [0],
      borderColor: '#7c6bff', backgroundColor: 'rgba(124,107,255,0.1)',
      fill: true, tension: 0.4, pointBackgroundColor: '#7c6bff', pointRadius: 4,
    }],
  };

  const monthData = {
    labels: monthLabels.length ? monthLabels : ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
    datasets: [{
      label: 'Applications',
      data: monthValues.length ? monthValues : new Array(12).fill(0),
      backgroundColor: (monthValues.length ? monthValues : []).map(v =>
        v > 10 ? '#7c6bff' : v > 5 ? '#a78bfa' : v > 0 ? '#c4b5fd' : '#1a1a24'),
      borderRadius: 6,
    }],
  };

  const donutData = {
    labels: ['Applied', 'Shortlisted', 'Interview', 'Accepted', 'Rejected'],
    datasets: [{
      data: [d.applied||0, d.shortlisted||0, d.interview||0, d.accepted||0, d.rejected||0],
      backgroundColor: ['#3b82f6','#7c6bff','#ec4899','#22c55e','#ef4444'],
      borderWidth: 0,
    }],
  };

  const companyBar = {
    labels: companyLabels.length ? companyLabels : ['No data'],
    datasets: [{
      label: 'Applications',
      data: companyValues.length ? companyValues : [0],
      backgroundColor: ['#7c6bff','#22c55e','#ef4444','#f59e0b','#3b82f6','#ec4899','#14b8a6','#8b5cf6','#f97316','#06b6d4'],
      borderRadius: 6,
    }],
  };

  const catBar = {
    labels: catLabels.length ? catLabels : ['No data'],
    datasets: [{
      label: 'Internships',
      data: catValues.length ? catValues : [0],
      backgroundColor: '#22c55e', borderRadius: 6,
    }],
  };

  const statCards = [
    { label: 'Total Users',    value: d.totalUsers       || 0, color: 'var(--accent2)' },
    { label: 'Students',       value: d.totalStudents    || 0, color: 'var(--blue)'    },
    { label: 'Internships',    value: d.totalInternships || 0, color: 'var(--green)'   },
    { label: 'Applications',   value: d.totalApplications|| 0, color: 'var(--amber)'   },
    { label: 'Accepted',       value: d.accepted         || 0, color: 'var(--green)'   },
    { label: 'Rejected',       value: d.rejected         || 0, color: 'var(--red)'     },
  ];

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">Admin Dashboard</h1>
          <Link to="/admin/internships" className="btn btn-primary btn-sm">+ Add Internship</Link>
        </div>

        {d.error && (
          <div className="alert alert-error" style={{ marginBottom: '1rem' }}>
            Analytics partial error: {d.error}
          </div>
        )}

        {/* Stat cards */}
        <div className="stats-grid" style={{ marginBottom: '2rem' }}>
          {statCards.map(s => (
            <div key={s.label} className="stat-card">
              <div className="num" style={{ color: s.color }}>{s.value}</div>
              <div className="lbl">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Row 1 — Line chart + Donut */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>📈 Applications per Day (Last 14 days)</h3>
            {dailyLabels.length === 0
              ? <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '0.88rem' }}>No application data yet</div>
              : <Line data={lineData} options={{ ...OPTS, plugins: { ...OPTS.plugins, legend: { display: false } } }} />
            }
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Status Breakdown</h3>
            {(d.totalApplications || 0) === 0
              ? <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '0.88rem' }}>No applications yet</div>
              : <Doughnut data={donutData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#9090b0', font: { size: 10 } } } } }} />
            }
          </div>
        </div>

        {/* Row 2 — Monthly heatmap */}
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '4px', fontSize: '1rem' }}>📅 Application Heatmap — Which months are most active?</h3>
          <p style={{ fontSize: '0.76rem', color: 'var(--text3)', marginBottom: '10px' }}>Darker bars = more applications that month</p>
          <Bar data={monthData} options={{ ...OPTS, plugins: { ...OPTS.plugins, legend: { display: false } } }} />
        </div>

        {/* Row 3 — Company-wise + Category-wise */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
          <div className="card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>🏢 Company-wise Applications (Top 10)</h3>
            {companyLabels.length === 0
              ? <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '0.88rem' }}>No application data yet</div>
              : <Bar data={companyBar} options={{ ...OPTS_H, plugins: { ...OPTS.plugins, legend: { display: false } } }} />
            }
          </div>
          <div className="card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>📂 Internships by Category</h3>
            {catLabels.length === 0
              ? <div style={{ height: '180px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: '0.88rem' }}>No internships yet</div>
              : <Bar data={catBar} options={{ ...OPTS, plugins: { ...OPTS.plugins, legend: { display: false } } }} />
            }
          </div>
        </div>

        {/* Quick links */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: '1rem' }}>
          {[
            { label: 'Manage Internships',  desc: `${d.totalInternships||0} listings`,    link: '/admin/internships',  icon: '💼' },
            { label: 'Review Applications', desc: `${d.totalApplications||0} total`,      link: '/admin/applications', icon: '📋' },
            { label: 'Manage Users',        desc: `${d.totalStudents||0} students`,        link: '/admin/users',        icon: '👥' },
            { label: 'Admin Features',      desc: 'Import, Export, Templates',            link: '/admin/features',     icon: '⚡' },
            { label: 'Announcements',       desc: 'Post notices to students',             link: '/announcements',      icon: '📢' },
            { label: 'Chat',               desc: 'Message students directly',             link: '/chat',               icon: '💬' },
          ].map(q => (
            <Link key={q.label} to={q.link} className="card card-hover" style={{ display: 'block', textDecoration: 'none' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{q.icon}</div>
              <h3 style={{ fontSize: '1rem', marginBottom: '4px' }}>{q.label}</h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--text2)', margin: 0 }}>{q.desc}</p>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
