import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getGamificationProfile, getLeaderboard } from '../services/api';
import { useAuth } from '../context/AuthContext';

const LEVEL_COLORS = { Bronze:'#cd7f32', Silver:'#c0c0c0', Gold:'#ffd700', Platinum:'#e5e4e2', Diamond:'#b9f2ff' };
const LEVEL_BG    = { Bronze:'rgba(205,127,50,0.1)', Silver:'rgba(192,192,192,0.1)', Gold:'rgba(255,215,0,0.1)', Platinum:'rgba(229,228,226,0.1)', Diamond:'rgba(185,242,255,0.1)' };

export default function Gamification() {
  const { user } = useAuth();
  const [profile, setProfile]     = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [tab, setTab]             = useState('profile');
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    Promise.all([
      getGamificationProfile(user.email),
      getLeaderboard(),
    ]).then(([p, l]) => {
      setProfile(p.data);
      setLeaderboard(l.data);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, [user.email]);

  if (loading) return <><Navbar /><div className="page"><div className="skeleton" style={{ height: '400px', borderRadius: '14px' }} /></div></>;

  const level      = profile?.level || 'Bronze';
  const points     = profile?.points || 0;
  const nextLevel  = profile?.nextLevelPoints || 75;
  const progress   = Math.min((points / nextLevel) * 100, 100);
  const streak     = profile?.streakDays || 0;
  const longest    = profile?.longestStreak || 0;

  const myRank = leaderboard.findIndex(e => e.email === user.email) + 1;

  const pointsBreakdown = [
    { action: 'Apply to internship',        points: 10,  icon: '📝' },
    { action: 'Complete profile to 80%',    points: 50,  icon: '⭐' },
    { action: 'Upload resume',              points: 20,  icon: '📄' },
    { action: 'Refer a friend',             points: 30,  icon: '🤝' },
    { action: 'Upload certificate',         points: 25,  icon: '📜' },
    { action: 'Write a review',             points: 15,  icon: '💬' },
    { action: 'Daily streak bonus (×day)',  points: '5×', icon: '🔥' },
  ];

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">🏆 Gamification</h1>
          {myRank > 0 && (
            <div style={{ background: 'rgba(124,107,255,0.1)', border: '1px solid rgba(124,107,255,0.3)', borderRadius: '20px', padding: '6px 16px', fontSize: '0.85rem', color: 'var(--accent2)' }}>
              Your Rank: #{myRank}
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="tabs" style={{ marginBottom: '1.5rem' }}>
          {[['profile','My Profile'],['leaderboard','🏅 Leaderboard'],['howto','How to Earn']].map(([k,v]) => (
            <button key={k} className={`tab-btn ${tab===k?'active':''}`} onClick={() => setTab(k)}>{v}</button>
          ))}
        </div>

        {tab === 'profile' && (
          <div>
            {/* Level card */}
            <div className="card" style={{ marginBottom: '1.5rem', background: LEVEL_BG[level] || 'var(--surface)', border: `1px solid ${LEVEL_COLORS[level] || 'var(--border)'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginBottom: '4px', letterSpacing: '0.05em' }}>CURRENT LEVEL</div>
                  <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Syne,sans-serif', color: LEVEL_COLORS[level] }}>{level}</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text2)', marginTop: '4px' }}>
                    {points} / {nextLevel} points to next level
                  </div>
                  <div style={{ marginTop: '10px', background: 'rgba(0,0,0,0.2)', borderRadius: '6px', height: '8px', width: '220px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: '6px', background: LEVEL_COLORS[level], width: `${progress}%`, transition: 'width 0.8s' }} />
                  </div>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '3rem', fontWeight: 800, color: LEVEL_COLORS[level], fontFamily: 'Syne,sans-serif' }}>{points}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text3)' }}>Total Points</div>
                </div>
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {[
                { icon: '🔥', label: 'Current Streak', value: `${streak} day${streak!==1?'s':''}`, color: 'var(--amber)' },
                { icon: '🏆', label: 'Longest Streak',  value: `${longest} day${longest!==1?'s':''}`, color: 'var(--accent2)' },
                { icon: '🏅', label: 'Badges Earned',   value: profile?.badgeCount || 0, color: 'var(--amber)' },
                { icon: '📊', label: 'My Rank',         value: myRank > 0 ? `#${myRank}` : '—', color: 'var(--green)' },
              ].map(s => (
                <div key={s.label} className="stat-card">
                  <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>{s.icon}</div>
                  <div className="num" style={{ color: s.color, fontSize: '1.4rem' }}>{s.value}</div>
                  <div className="lbl">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Streak info */}
            <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.2rem' }}>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem' }}>🔥 Daily Streak</h3>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '10px' }}>
                {[...Array(7)].map((_, i) => (
                  <div key={i} style={{
                    width: '36px', height: '36px', borderRadius: '8px',
                    background: i < streak ? 'var(--amber)' : 'var(--surface2)',
                    border: `1px solid ${i < streak ? 'rgba(245,158,11,0.5)' : 'var(--border)'}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '1rem',
                  }}>
                    {i < streak ? '🔥' : '○'}
                  </div>
                ))}
                <div style={{ display: 'flex', alignItems: 'center', marginLeft: '6px', fontSize: '0.8rem', color: 'var(--text3)' }}>
                  {streak >= 7 ? '🎉 Full week!' : `${7 - streak} more to complete the week`}
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: 'var(--text2)' }}>
                Apply to an internship every day to maintain your streak and earn bonus points!
              </p>
            </div>

            {/* Badges */}
            {profile?.badges?.length > 0 && (
              <div className="card">
                <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>🏅 My Badges ({profile.badges.length})</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: '10px' }}>
                  {profile.badges.map(b => (
                    <div key={b.id} style={{ padding: '12px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(245,158,11,0.2)', textAlign: 'center' }}>
                      <div style={{ fontSize: '2rem', marginBottom: '6px' }}>{b.badgeIcon}</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--amber)', marginBottom: '3px' }}>{b.badgeName}</div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text3)' }}>{b.badgeDescription}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'leaderboard' && (
          <div className="card">
            <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Top Students by Points</h3>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Rank</th><th>Student</th><th>Level</th><th>Points</th><th>Streak</th><th>Badges</th></tr>
                </thead>
                <tbody>
                  {leaderboard.map(entry => {
                    const isMe = entry.email === user.email;
                    const medal = entry.rank === 1 ? '🥇' : entry.rank === 2 ? '🥈' : entry.rank === 3 ? '🥉' : `#${entry.rank}`;
                    return (
                      <tr key={entry.email} style={{ background: isMe ? 'rgba(124,107,255,0.06)' : '' }}>
                        <td style={{ fontWeight: 700, fontSize: '1.1rem' }}>{medal}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{ width: '32px', height: '32px', borderRadius: '50%',
                              background: isMe ? 'var(--accent)' : 'var(--surface2)',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: isMe ? 'white' : 'var(--accent2)', fontWeight: 700, fontSize: '0.82rem' }}>
                              {entry.name?.charAt(0)?.toUpperCase()}
                            </div>
                            <div>
                              <div style={{ fontWeight: isMe ? 700 : 500, fontSize: '0.88rem', color: isMe ? 'var(--accent2)' : 'var(--text)' }}>
                                {entry.name} {isMe && '(You)'}
                              </div>
                              {entry.college && <div style={{ fontSize: '0.74rem', color: 'var(--text3)' }}>{entry.college}</div>}
                            </div>
                          </div>
                        </td>
                        <td><span style={{ fontSize: '0.8rem', fontWeight: 600, color: LEVEL_COLORS[entry.level] }}>{entry.level}</span></td>
                        <td style={{ fontWeight: 700, color: 'var(--accent2)' }}>{entry.points}</td>
                        <td>{entry.streak > 0 ? `🔥 ${entry.streak}d` : '—'}</td>
                        <td>{entry.badges > 0 ? `🏅 ${entry.badges}` : '—'}</td>
                      </tr>
                    );
                  })}
                  {leaderboard.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--text3)', padding: '2rem' }}>No data yet. Start applying to earn points!</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {tab === 'howto' && (
          <div>
            <div className="card" style={{ marginBottom: '1rem' }}>
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>💰 How to Earn Points</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {pointsBreakdown.map(p => (
                  <div key={p.action} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--surface2)', borderRadius: 'var(--radius-sm)' }}>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontSize: '1.2rem' }}>{p.icon}</span>
                      <span style={{ fontSize: '0.88rem', color: 'var(--text2)' }}>{p.action}</span>
                    </div>
                    <span style={{ fontWeight: 700, color: 'var(--accent2)', fontSize: '0.9rem' }}>+{p.points} pts</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card">
              <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>🎖 Level Progression</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {[
                  { level:'Bronze',   min:0,   max:74,  icon:'🥉' },
                  { level:'Silver',   min:75,  max:149, icon:'🥈' },
                  { level:'Gold',     min:150, max:299, icon:'🥇' },
                  { level:'Platinum', min:300, max:499, icon:'💎' },
                  { level:'Diamond',  min:500, max:'∞', icon:'💠' },
                ].map(l => {
                  const isCurrentLevel = l.level === level;
                  return (
                    <div key={l.level} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      padding: '10px 14px', borderRadius: 'var(--radius-sm)',
                      background: isCurrentLevel ? LEVEL_BG[l.level] : 'var(--surface2)',
                      border: `1px solid ${isCurrentLevel ? LEVEL_COLORS[l.level] : 'var(--border)'}`,
                    }}>
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <span style={{ fontSize: '1.3rem' }}>{l.icon}</span>
                        <span style={{ fontWeight: isCurrentLevel ? 700 : 500, color: isCurrentLevel ? LEVEL_COLORS[l.level] : 'var(--text2)' }}>
                          {l.level} {isCurrentLevel && '← You are here'}
                        </span>
                      </div>
                      <span style={{ fontSize: '0.82rem', color: 'var(--text3)' }}>{l.min} – {l.max} pts</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
