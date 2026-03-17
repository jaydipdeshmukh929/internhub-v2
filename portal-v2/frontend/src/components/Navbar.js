import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getUnreadCount, getChatUnread } from '../services/api';

export default function Navbar() {
  const { user, signOut } = useAuth();
  const { dark, toggle }  = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();
  const [unread, setUnread]     = useState(0);
  const [chatUnread, setChatUnread] = useState(0);

  useEffect(() => {
    if (user?.email) {
      getUnreadCount(user.email).then(r => setUnread(r.data.count || 0)).catch(() => {});
      getChatUnread(user.email).then(r => setChatUnread(r.data.count || 0)).catch(() => {});
    }
  }, [user, location.pathname]);

  const logout = () => { signOut(); navigate('/login'); };
  const active = p => location.pathname === p ? 'nav-link active' : 'nav-link';

  if (!user) return null;

  const NotifLink = ({ to, children, count }) => (
    <Link to={to} className={active(to)} style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {children}
      {count > 0 && (
        <span className="notif-badge">{count > 9 ? '9+' : count}</span>
      )}
    </Link>
  );

  return (
    <nav className="navbar">
      <Link to={user.role === 'ADMIN' ? '/admin' : '/dashboard'} className="brand">⚡ InternHub</Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '2px', flexWrap: 'wrap' }}>
        {user.role === 'STUDENT' && (<>
          <Link to="/dashboard"       className={active('/dashboard')}>Explore</Link>
          <Link to="/my-applications" className={active('/my-applications')}>Applications</Link>
          <Link to="/saved"           className={active('/saved')}>Saved</Link>
          <Link to="/features"        className={active('/features')}>Features</Link>
          <Link to="/analytics"       className={active('/analytics')}>Analytics</Link>
          <Link to="/gamification"    className={active('/gamification')}>🏆</Link>
          <Link to="/announcements"   className={active('/announcements')}>📢</Link>
          <NotifLink to="/chat"       count={chatUnread}>💬</NotifLink>
          <Link to="/profile"         className={active('/profile')}>Profile</Link>
          <NotifLink to="/notifications" count={unread}>🔔</NotifLink>
        </>)}

        {user.role === 'ADMIN' && (<>
          <Link to="/admin"              className={active('/admin')}>Dashboard</Link>
          <Link to="/admin/internships"  className={active('/admin/internships')}>Internships</Link>
          <Link to="/admin/applications" className={active('/admin/applications')}>Applications</Link>
          <Link to="/admin/users"        className={active('/admin/users')}>Users</Link>
          <Link to="/admin/features"     className={active('/admin/features')}>Features</Link>
          <Link to="/announcements"      className={active('/announcements')}>📢</Link>
          <Link to="/qna"                className={active('/qna')}>Q&A</Link>
          <NotifLink to="/chat"          count={chatUnread}>💬</NotifLink>
        </>)}

        {/* Dark/Light toggle */}
        <button onClick={toggle} className="nav-link" style={{ fontSize: '1rem', padding: '6px 10px' }}
          title={dark ? 'Switch to light mode' : 'Switch to dark mode'}>
          {dark ? '☀️' : '🌙'}
        </button>

        <span style={{ color: 'var(--text3)', fontSize: '0.78rem', margin: '0 4px' }}>
          {user.name?.split(' ')[0]}
        </span>
        <button className="nav-btn" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
