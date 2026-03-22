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
  const [unread, setUnread]         = useState(0);
  const [chatUnread, setChatUnread] = useState(0);

  useEffect(() => {
    if (user?.email) {
      getUnreadCount(user.email).then(r => setUnread(r.data.count||0)).catch(()=>{});
      getChatUnread(user.email).then(r => setChatUnread(r.data.count||0)).catch(()=>{});
    }
  }, [user, location.pathname]);

  const logout = () => { signOut(); navigate('/login'); };
  const a = p => location.pathname.startsWith(p) && (p.length > 1 || location.pathname === '/') ? 'nav-link active' : 'nav-link';

  if (!user) return null;

  const Badge = ({ to, label, count }) => (
    <Link to={to} className={a(to)} style={{ position:'relative', display:'inline-flex', alignItems:'center' }}>
      {label}
      {count > 0 && <span className="notif-badge">{count > 9 ? '9+' : count}</span>}
    </Link>
  );

  return (
    <nav className="navbar">
      <Link to={user.role==='ADMIN' ? '/admin' : '/dashboard'} className="brand">⚡ InternHub</Link>
      <div style={{ display:'flex', alignItems:'center', gap:'2px', flexWrap:'wrap' }}>

        {user.role === 'STUDENT' && (<>
          <Link to="/dashboard"       className={a('/dashboard')}>Explore</Link>
          <Link to="/my-applications" className={a('/my-applications')}>Applications</Link>
          <Link to="/saved"           className={a('/saved')}>Saved</Link>
          <Link to="/features"        className={a('/features')}>Features</Link>
          <Link to="/ai"              className={a('/ai')}>🤖 AI</Link>
          <Link to="/documents"       className={a('/documents')}>📄 Docs</Link>
          <Link to="/forum"           className={a('/forum')}>💬 Forum</Link>
          <Link to="/analytics"       className={a('/analytics')}>Analytics</Link>
          <Link to="/gamification"    className={a('/gamification')}>🏆</Link>
          <Link to="/announcements"   className={a('/announcements')}>📢</Link>
          <Badge to="/chat"           label="💬" count={chatUnread} />
          <Link to="/profile"         className={a('/profile')}>Profile</Link>
          <Link to="/security"        className={a('/security')}>🔒</Link>
          <Badge to="/notifications"  label="🔔" count={unread} />
        </>)}

        {user.role === 'ADMIN' && (<>
          <Link to="/admin"                    className={a('/admin')}>Dashboard</Link>
          <Link to="/admin/internships"        className={a('/admin/internships')}>Internships</Link>
          <Link to="/admin/applications"       className={a('/admin/applications')}>Applications</Link>
          <Link to="/admin/users"              className={a('/admin/users')}>Users</Link>
          <Link to="/admin/features"           className={a('/admin/features')}>Features</Link>
          <Link to="/admin/analytics/advanced" className={a('/admin/analytics/advanced')}>Analytics+</Link>
          <Link to="/forum"                    className={a('/forum')}>Forum</Link>
          <Link to="/announcements"            className={a('/announcements')}>📢</Link>
          <Badge to="/chat"                    label="💬" count={chatUnread} />
          <Link to="/admin/profile"            className={a('/admin/profile')}>Profile</Link>
        </>)}

        <button onClick={toggle} className="nav-link" style={{ fontSize:'1rem', padding:'6px 10px' }}>
          {dark ? '☀️' : '🌙'}
        </button>
        <span style={{ color:'var(--text3)', fontSize:'0.78rem', margin:'0 4px' }}>{user.name?.split(' ')[0]}</span>
        <button className="nav-btn" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
