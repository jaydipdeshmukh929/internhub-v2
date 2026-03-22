import React, { useState, useEffect } from 'react';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Filler } from 'chart.js';
import Navbar from '../components/Navbar';
import API from '../services/api';

ChartJS.register(ArcElement, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Tooltip, Legend, Filler);

const getFunnel = () => API.get('/analytics/advanced/funnel');
const getTimeHire = () => API.get('/analytics/advanced/time-hire');
const getCohort  = () => API.get('/analytics/advanced/cohort');

const OPTS = { responsive:true, plugins:{ legend:{ labels:{ color:'#9090b0', font:{ size:11 } } } }, scales:{ x:{ ticks:{ color:'#9090b0' }, grid:{ color:'rgba(255,255,255,0.05)' } }, y:{ ticks:{ color:'#9090b0' }, grid:{ color:'rgba(255,255,255,0.05)' }, beginAtZero:true } } };

export default function AdvancedAnalytics() {
  const [funnel, setFunnel]   = useState(null);
  const [timeHire, setTimeHire] = useState(null);
  const [cohort, setCohort]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab]         = useState('funnel');

  useEffect(() => {
    Promise.all([getFunnel(), getTimeHire(), getCohort()])
      .then(([f,t,c]) => { setFunnel(f.data); setTimeHire(t.data); setCohort(c.data); })
      .catch(()=>{})
      .finally(()=>setLoading(false));
  }, []);

  if (loading) return <><Navbar /><div className="page"><div className="skeleton" style={{ height:'400px', borderRadius:'14px' }} /></div></>;

  const funnelLabels = funnel?.funnel ? Object.keys(funnel.funnel) : [];
  const funnelValues = funnel?.funnel ? Object.values(funnel.funnel) : [];
  const funnelData = { labels: funnelLabels, datasets: [{ label:'Applications', data: funnelValues, backgroundColor:['#3b82f6','#7c6bff','#ec4899','#f59e0b','#22c55e'], borderRadius:6 }] };

  const distLabels = timeHire?.distribution ? Object.keys(timeHire.distribution) : [];
  const distValues = timeHire?.distribution ? Object.values(timeHire.distribution) : [];
  const distData = { labels: distLabels, datasets: [{ data: distValues, backgroundColor:['#22c55e','#7c6bff','#f59e0b','#ef4444'], borderWidth:0 }] };

  const cohortLabels = cohort?.registrationsByMonth ? Object.keys(cohort.registrationsByMonth).slice(-12) : [];
  const cohortValues = cohort?.registrationsByMonth ? Object.values(cohort.registrationsByMonth).slice(-12) : [];
  const cohortData = { labels: cohortLabels, datasets: [{ label:'New Students', data: cohortValues, borderColor:'#7c6bff', backgroundColor:'rgba(124,107,255,0.1)', fill:true, tension:0.4 }] };

  const profileLabels = cohort?.profileDistribution ? Object.keys(cohort.profileDistribution) : [];
  const profileValues = cohort?.profileDistribution ? Object.values(cohort.profileDistribution) : [];
  const profileData = { labels: profileLabels, datasets: [{ label:'Students', data: profileValues, backgroundColor:['#ef4444','#f59e0b','#3b82f6','#22c55e'], borderRadius:6 }] };

  return (
    <>
      <Navbar />
      <div className="page">
        <h1 className="page-title">📊 Advanced Analytics</h1>
        <div className="tabs" style={{ marginBottom:'1.5rem' }}>
          {[['funnel','🎯 Conversion Funnel'],['timehire','⏱ Time-to-Hire'],['cohort','👥 Cohort Analysis']].map(([k,v])=>(
            <button key={k} className={`tab-btn ${tab===k?'active':''}`} onClick={()=>setTab(k)}>{v}</button>
          ))}
        </div>

        {tab === 'funnel' && funnel && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
              {funnelLabels.map((label,i) => {
                const val = funnelValues[i] || 0;
                const rate = funnel.rates ? Object.values(funnel.rates)[i] : 0;
                const colors = ['#3b82f6','#7c6bff','#ec4899','#f59e0b','#22c55e'];
                return (
                  <div key={label} className="stat-card">
                    <div className="num" style={{ color:colors[i], fontSize:'1.8rem' }}>{val}</div>
                    <div className="lbl">{label}</div>
                    {rate > 0 && <div style={{ fontSize:'0.72rem', color:colors[i], marginTop:'2px' }}>{rate}%</div>}
                  </div>
                );
              })}
            </div>
            <div className="card">
              <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Application Pipeline Funnel</h3>
              <Bar data={funnelData} options={{ ...OPTS, plugins:{ ...OPTS.plugins, legend:{ display:false } } }} />
              <p style={{ fontSize:'0.78rem', color:'var(--text3)', marginTop:'10px', textAlign:'center' }}>
                Shows how many applications move through each stage of the hiring pipeline
              </p>
            </div>
          </div>
        )}

        {tab === 'timehire' && timeHire && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginBottom:'1.5rem' }}>
              {[['Avg. Days to Hire', timeHire.avgDays,'var(--accent2)'],['Fastest Hire', timeHire.minDays + ' days','var(--green)'],['Longest Hire', timeHire.maxDays + ' days','var(--amber)']].map(([l,v,c])=>(
                <div key={l} className="stat-card"><div className="num" style={{ color:c }}>{v}</div><div className="lbl">{l}</div></div>
              ))}
            </div>
            {timeHire.totalAccepted > 0 ? (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
                <div className="card">
                  <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>⏱ Days to Acceptance Distribution</h3>
                  <Doughnut data={distData} options={{ responsive:true, plugins:{ legend:{ position:'bottom', labels:{ color:'#9090b0', font:{ size:11 } } } } }} />
                </div>
                <div className="card">
                  <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>📈 What this means</h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                    <div style={{ padding:'10px 14px', background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:'8px' }}>
                      <div style={{ fontWeight:600, color:'var(--green)', fontSize:'0.88rem' }}>Average: {timeHire.avgDays} days</div>
                      <div style={{ fontSize:'0.78rem', color:'var(--text2)', marginTop:'3px' }}>From application submission to acceptance decision</div>
                    </div>
                    {distValues[0] > 0 && <div style={{ padding:'10px 14px', background:'rgba(59,130,246,0.08)', border:'1px solid rgba(59,130,246,0.2)', borderRadius:'8px', fontSize:'0.82rem', color:'var(--blue)' }}>⚡ {distValues[0]} applications were decided within 7 days — excellent response time!</div>}
                    {distValues[3] > 0 && <div style={{ padding:'10px 14px', background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.2)', borderRadius:'8px', fontSize:'0.82rem', color:'var(--amber)' }}>⚠️ {distValues[3]} applications took 30+ days — consider reviewing your pipeline.</div>}
                  </div>
                </div>
              </div>
            ) : (
              <div className="empty-state card"><div className="icon">⏱</div><p>No accepted applications yet. Data will appear once applications are accepted.</p></div>
            )}
          </div>
        )}

        {tab === 'cohort' && cohort && (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
              {[
                ['Total Students', cohort.totalStudents||0, 'var(--accent2)'],
                ['Active Students', cohort.activeStudents||0, 'var(--green)'],
                ['Activation Rate', (cohort.activationRate||0)+'%', 'var(--blue)'],
                ['Premium Students', cohort.premiumStudents||0, 'var(--amber)'],
              ].map(([l,v,c])=>(
                <div key={l} className="stat-card"><div className="num" style={{ color:c }}>{v}</div><div className="lbl">{l}</div></div>
              ))}
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
              <div className="card">
                <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>👥 Student Registrations by Month</h3>
                {cohortLabels.length > 0 ? <Line data={cohortData} options={{ ...OPTS, plugins:{ ...OPTS.plugins, legend:{ display:false } } }} /> : <p style={{ color:'var(--text3)', textAlign:'center' }}>No data yet</p>}
              </div>
              <div className="card">
                <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>📊 Profile Completion Distribution</h3>
                {profileLabels.length > 0 ? <Bar data={profileData} options={{ ...OPTS, plugins:{ ...OPTS.plugins, legend:{ display:false } } }} /> : <p style={{ color:'var(--text3)', textAlign:'center' }}>No data yet</p>}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
