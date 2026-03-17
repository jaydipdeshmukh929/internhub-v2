import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { getNotifications, markAllRead } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Notifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { load(); }, []);

  const load = async () => {
    try {
      const r = await getNotifications(user.email);
      setNotifications(r.data);
    } catch {}
    finally { setLoading(false); }
  };

  const markRead = async () => {
    await markAllRead(user.email);
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const timeAgo = (dt) => {
    const diff = Date.now() - new Date(dt).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  const typeIcon = (type) => {
    if (type === 'APPLICATION_UPDATE') return '📋';
    if (type === 'INTERVIEW') return '📅';
    if (type === 'NEW_INTERNSHIP') return '✨';
    return '🔔';
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <Navbar />
      <div className="page" style={{ maxWidth: '720px' }}>
        <div className="page-header">
          <h1 className="page-title">
            Notifications
            {unreadCount > 0 && (
              <span style={{ background: 'var(--red)', color: 'white', fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', marginLeft: '10px', verticalAlign: 'middle' }}>
                {unreadCount} new
              </span>
            )}
          </h1>
          {unreadCount > 0 && (
            <button className="btn btn-outline btn-sm" onClick={markRead}>Mark all read</button>
          )}
        </div>

        {loading ? (
          <div>{[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: '70px', borderRadius: '10px', marginBottom: '8px' }} />)}</div>
        ) : notifications.length === 0 ? (
          <div className="empty-state">
            <div className="icon">🔔</div>
            <p>No notifications yet.</p>
          </div>
        ) : (
          notifications.map(n => (
            <div key={n.id} className={`notif-item ${!n.read ? 'unread' : ''}`}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                <span style={{ fontSize: '1.3rem' }}>{typeIcon(n.type)}</span>
                <div style={{ flex: 1 }}>
                  <div className="notif-title">{n.title}</div>
                  <div className="notif-msg">{n.message}</div>
                  <div className="notif-time">{timeAgo(n.createdAt)}</div>
                </div>
                {!n.read && (
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', marginTop: '6px', flexShrink: 0 }} />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
