import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import { getChatContacts, getChatMessages, sendChatMessage, getAllUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Chat() {
  const { user } = useAuth();
  const [contacts, setContacts]   = useState([]);
  const [users, setUsers]         = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages]   = useState([]);
  const [newMsg, setNewMsg]       = useState('');
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(false);
  const bottomRef = useRef(null);
  const pollRef   = useRef(null);

  useEffect(() => {
    loadContacts();
    if (user.role === 'ADMIN') loadAllUsers();
  }, []);

  useEffect(() => {
    if (activeChat) {
      loadMessages();
      pollRef.current = setInterval(loadMessages, 3000);
    }
    return () => clearInterval(pollRef.current);
  }, [activeChat]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const loadContacts = async () => {
    try { const r = await getChatContacts(user.email); setContacts(r.data); } catch {}
  };

  const loadAllUsers = async () => {
    try { const r = await getAllUsers(); setUsers(r.data.filter(u => u.email !== user.email)); } catch {}
  };

  const loadMessages = async () => {
    if (!activeChat) return;
    try {
      const r = await getChatMessages(user.email, activeChat.email);
      setMessages(r.data);
    } catch {}
  };

  const startChat = (contactEmail, contactName) => {
    setActiveChat({ email: contactEmail, name: contactName });
  };

  const send = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeChat) return;
    setLoading(true);
    try {
      await sendChatMessage({
        senderEmail: user.email,
        senderName: user.name,
        receiverEmail: activeChat.email,
        message: newMsg.trim(),
      });
      setNewMsg('');
      loadMessages();
      loadContacts();
    } catch {}
    finally { setLoading(false); }
  };

  const timeAgo = (dt) => {
  if (!dt) return '';
  // Backend stores LocalDateTime in IST but without timezone marker.
  // JS parses it as UTC, so we add +5:30 offset to correct it.
  const date = new Date(dt + '+05:30');
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
};

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <>
      <Navbar />
      <div className="page" style={{ padding: '1rem 2rem' }}>
        <h1 className="page-title" style={{ marginBottom: '1rem' }}>💬 Messages</h1>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1rem', height: 'calc(100vh - 160px)', minHeight: '500px' }}>

          {/* Sidebar */}
          <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0' }}>
            <div style={{ padding: '1rem', borderBottom: '1px solid var(--border)' }}>
              <input className="form-control" placeholder="Search people..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ padding: '8px 12px', fontSize: '0.85rem' }} />
            </div>

            <div style={{ flex: 1, overflowY: 'auto' }}>
              {/* Existing contacts */}
              {contacts.length > 0 && (
                <div style={{ padding: '8px 12px', fontSize: '0.72rem', color: 'var(--text3)', fontWeight: 600, letterSpacing: '0.05em' }}>
                  RECENT CHATS
                </div>
              )}
              {contacts.map((c, i) => (
                <div key={i}
                  onClick={() => startChat(c.email, c.name)}
                  style={{
                    padding: '12px 16px', cursor: 'pointer', display: 'flex', gap: '10px',
                    alignItems: 'center', transition: 'background 0.15s',
                    background: activeChat?.email === c.email ? 'var(--surface2)' : 'transparent',
                    borderBottom: '1px solid var(--border)',
                  }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontWeight: 700, fontSize: '0.85rem' }}>
                    {c.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name || c.email}</span>
                      {c.unread > 0 && <span style={{ background: 'var(--accent)', color: 'white', fontSize: '0.7rem', padding: '1px 6px', borderRadius: '10px', flexShrink: 0, marginLeft: '4px' }}>{c.unread}</span>}
                    </div>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text3)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {c.lastMessage}
                    </div>
                  </div>
                </div>
              ))}

              {/* All users (admin can message anyone) */}
              {user.role === 'ADMIN' && search && filteredUsers.length > 0 && (
                <>
                  <div style={{ padding: '8px 12px', fontSize: '0.72rem', color: 'var(--text3)', fontWeight: 600, letterSpacing: '0.05em' }}>
                    ALL USERS
                  </div>
                  {filteredUsers.map(u => (
                    <div key={u.id}
                      onClick={() => startChat(u.email, u.name)}
                      style={{ padding: '10px 16px', cursor: 'pointer', display: 'flex', gap: '10px', alignItems: 'center',
                        background: activeChat?.email === u.email ? 'var(--surface2)' : 'transparent',
                        borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}>
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                        background: 'var(--surface2)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--accent2)', fontWeight: 700, fontSize: '0.8rem' }}>
                        {u.name?.charAt(0)?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', fontWeight: 500 }}>{u.name}</div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--text3)' }}>{u.role}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}

              {contacts.length === 0 && !search && (
                <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text3)', fontSize: '0.85rem' }}>
                  <div style={{ fontSize: '2rem', marginBottom: '8px' }}>💬</div>
                  No conversations yet.
                  {user.role === 'STUDENT' && <div style={{ marginTop: '8px' }}>Search for admin to start chatting.</div>}
                </div>
              )}
            </div>
          </div>

          {/* Chat window */}
          {activeChat ? (
            <div className="card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: '0' }}>
              {/* Chat header */}
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent2))',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '0.9rem' }}>
                  {activeChat.name?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{activeChat.name}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--green)' }}>● Active</div>
                </div>
              </div>

              {/* Messages */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {messages.length === 0 && (
                  <div style={{ textAlign: 'center', color: 'var(--text3)', marginTop: '2rem', fontSize: '0.88rem' }}>
                    Start the conversation 👋
                  </div>
                )}
                {messages.map(m => {
                  const isMe = m.senderEmail === user.email;
                  return (
                    <div key={m.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start' }}>
                      <div style={{
                        maxWidth: '70%', padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                        background: isMe ? 'var(--accent)' : 'var(--surface2)',
                        color: isMe ? 'white' : 'var(--text)',
                        fontSize: '0.88rem', lineHeight: '1.5',
                      }}>
                        <div>{m.message}</div>
                        <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '3px', textAlign: isMe ? 'right' : 'left' }}>
                          {timeAgo(m.sentAt)} {isMe && (m.read ? '✓✓' : '✓')}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <form onSubmit={send} style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '10px' }}>
                <input className="form-control" placeholder="Type a message..."
                  value={newMsg} onChange={e => setNewMsg(e.target.value)}
                  style={{ flex: 1, padding: '10px 14px', borderRadius: '20px' }} />
                <button className="btn btn-primary" type="submit" disabled={loading || !newMsg.trim()}
                  style={{ borderRadius: '20px', padding: '10px 20px' }}>
                  Send →
                </button>
              </form>
            </div>
          ) : (
            <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'var(--text3)' }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <p style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '6px' }}>Select a conversation</p>
              <p style={{ fontSize: '0.85rem' }}>Choose from your contacts or search for someone to message</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
