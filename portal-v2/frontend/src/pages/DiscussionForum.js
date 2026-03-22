import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

const getPosts    = cat => API.get('/discussions', { params: { category: cat } });
const createPost  = d   => API.post('/discussions', d);
const getPost     = id  => API.get(`/discussions/${id}`);
const addReply    = (id,d) => API.post(`/discussions/${id}/reply`, d);
const likePost    = id  => API.post(`/discussions/${id}/like`);
const deletePost  = id  => API.delete(`/discussions/${id}`);

const CATS = ['ALL','GENERAL','INTERVIEW_TIPS','CAREER_ADVICE','COMPANIES','OFF_TOPIC'];
const CAT_ICONS = { ALL:'🌐', GENERAL:'💬', INTERVIEW_TIPS:'🎤', CAREER_ADVICE:'💼', COMPANIES:'🏢', OFF_TOPIC:'😄' };
const CAT_COLORS = { GENERAL:'var(--blue)', INTERVIEW_TIPS:'var(--green)', CAREER_ADVICE:'var(--accent2)', COMPANIES:'var(--amber)', OFF_TOPIC:'var(--pink)' };

export default function DiscussionForum() {
  const { user } = useAuth();
  const [posts, setPosts]         = useState([]);
  const [cat, setCat]             = useState('ALL');
  const [view, setView]           = useState('list'); // list | post | new
  const [activePost, setActivePost] = useState(null);
  const [replies, setReplies]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [newPost, setNewPost]     = useState({ title:'', content:'', category:'GENERAL' });
  const [replyText, setReplyText] = useState('');

  useEffect(() => { load(); }, [cat]);

  const load = async () => {
    setLoading(true);
    try { const r = await getPosts(cat); setPosts(r.data); } catch {}
    finally { setLoading(false); }
  };

  const openPost = async (id) => {
    try {
      const r = await getPost(id);
      setActivePost(r.data.post);
      setReplies(r.data.replies || []);
      setView('post');
    } catch {}
  };

  const submitPost = async (e) => {
    e.preventDefault();
    try {
      await createPost({ ...newPost, email: user.email, name: user.name });
      setNewPost({ title:'', content:'', category:'GENERAL' });
      setView('list'); load();
    } catch {}
  };

  const submitReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    try {
      await addReply(activePost.id, { content: replyText, email: user.email, name: user.name });
      setReplyText('');
      openPost(activePost.id);
    } catch {}
  };

  const handleLike = async (id) => {
    try { await likePost(id); load(); } catch {}
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this post?')) return;
    try { await deletePost(id); setView('list'); load(); } catch {}
  };

  const timeAgo = dt => {
    const diff = Date.now() - new Date(dt).getTime();
    const m = Math.floor(diff/60000);
    if (m<1) return 'just now';
    if (m<60) return m+'m ago';
    const h = Math.floor(m/60);
    if (h<24) return h+'h ago';
    return Math.floor(h/24)+'d ago';
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h1 className="page-title">💬 Discussion Forum</h1>
          {view === 'list' && (
            <button className="btn btn-primary btn-sm" onClick={() => setView('new')}>+ New Post</button>
          )}
          {view !== 'list' && (
            <button className="btn btn-outline btn-sm" onClick={() => setView('list')}>← Back</button>
          )}
        </div>

        {/* Category tabs */}
        {view === 'list' && (
          <>
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'1.5rem' }}>
              {CATS.map(c => (
                <button key={c} onClick={() => setCat(c)} style={{
                  padding:'6px 14px', borderRadius:'18px', border:'1px solid', cursor:'pointer', fontSize:'0.82rem', fontWeight:500,
                  background: cat===c ? 'var(--accent)' : 'var(--surface)',
                  borderColor: cat===c ? 'var(--accent)' : 'var(--border)',
                  color: cat===c ? 'white' : 'var(--text2)',
                }}>{CAT_ICONS[c]} {c.replace('_',' ')}</button>
              ))}
            </div>

            {loading ? (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {[...Array(4)].map((_,i) => <div key={i} className="skeleton" style={{ height:'80px', borderRadius:'10px' }} />)}
              </div>
            ) : posts.length === 0 ? (
              <div className="empty-state card"><div className="icon">💬</div><p>No posts yet. Be the first to start a discussion!</p></div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {posts.map(p => (
                  <div key={p.id} className="card card-hover" style={{ cursor:'pointer', padding:'1rem 1.2rem' }} onClick={() => openPost(p.id)}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:'1rem' }}>
                      <div style={{ flex:1 }}>
                        <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'6px' }}>
                          <span style={{ fontSize:'0.72rem', padding:'2px 8px', borderRadius:'10px', background:'rgba(124,107,255,0.1)', color: CAT_COLORS[p.category] || 'var(--accent2)', fontWeight:600 }}>
                            {CAT_ICONS[p.category]} {p.category?.replace('_',' ')}
                          </span>
                          {p.pinned && <span style={{ fontSize:'0.7rem', color:'var(--amber)' }}>📌 Pinned</span>}
                        </div>
                        <div style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:'4px' }}>{p.title}</div>
                        <div style={{ fontSize:'0.8rem', color:'var(--text2)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', maxWidth:'500px' }}>
                          {p.content}
                        </div>
                      </div>
                      <div style={{ textAlign:'right', flexShrink:0 }}>
                        <div style={{ fontSize:'0.78rem', color:'var(--text3)', marginBottom:'4px' }}>{timeAgo(p.postedAt)}</div>
                        <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
                          <span style={{ fontSize:'0.78rem', color:'var(--text3)' }}>👍 {p.likes||0}</span>
                          <span style={{ fontSize:'0.78rem', color:'var(--text3)' }}>💬 {p.replies||0}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ fontSize:'0.75rem', color:'var(--text3)', marginTop:'6px' }}>
                      by {p.authorName}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* New Post */}
        {view === 'new' && (
          <form onSubmit={submitPost} className="card" style={{ maxWidth:'700px' }}>
            <h3 style={{ marginBottom:'1rem', fontSize:'1rem' }}>Create New Post</h3>
            <div className="form-group">
              <label>Category</label>
              <select className="form-control" value={newPost.category} onChange={e => setNewPost(f=>({...f,category:e.target.value}))}>
                {CATS.filter(c=>c!=='ALL').map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c.replace('_',' ')}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Title</label>
              <input className="form-control" placeholder="What's your question or topic?" value={newPost.title} onChange={e => setNewPost(f=>({...f,title:e.target.value}))} required />
            </div>
            <div className="form-group">
              <label>Content</label>
              <textarea className="form-control" rows={6} placeholder="Share your thoughts, question, or experience..." value={newPost.content} onChange={e => setNewPost(f=>({...f,content:e.target.value}))} required />
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button className="btn btn-outline" type="button" onClick={() => setView('list')}>Cancel</button>
              <button className="btn btn-primary" type="submit" style={{ flex:1 }}>Post Discussion</button>
            </div>
          </form>
        )}

        {/* Post Detail */}
        {view === 'post' && activePost && (
          <div style={{ maxWidth:'750px' }}>
            <div className="card" style={{ marginBottom:'1rem' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                <span style={{ fontSize:'0.75rem', padding:'3px 10px', borderRadius:'10px', background:'rgba(124,107,255,0.1)', color: CAT_COLORS[activePost.category] || 'var(--accent2)', fontWeight:600 }}>
                  {CAT_ICONS[activePost.category]} {activePost.category?.replace('_',' ')}
                </span>
                {activePost.authorEmail === user.email && (
                  <button onClick={() => handleDelete(activePost.id)} style={{ background:'none', border:'none', color:'var(--red)', cursor:'pointer', fontSize:'0.8rem' }}>🗑 Delete</button>
                )}
              </div>
              <h2 style={{ fontSize:'1.3rem', marginBottom:'8px' }}>{activePost.title}</h2>
              <div style={{ fontSize:'0.78rem', color:'var(--text3)', marginBottom:'1rem' }}>
                by {activePost.authorName} · {timeAgo(activePost.postedAt)}
              </div>
              <p style={{ color:'var(--text2)', lineHeight:'1.8', whiteSpace:'pre-wrap' }}>{activePost.content}</p>
              <div style={{ marginTop:'1rem', paddingTop:'1rem', borderTop:'1px solid var(--border)', display:'flex', gap:'12px' }}>
                <button className="btn btn-outline btn-sm" onClick={() => handleLike(activePost.id)}>👍 Like ({activePost.likes||0})</button>
                <span style={{ fontSize:'0.82rem', color:'var(--text3)', alignSelf:'center' }}>💬 {replies.length} replies</span>
              </div>
            </div>

            {/* Replies */}
            {replies.map(r => (
              <div key={r.id} className="card" style={{ marginBottom:'8px', padding:'0.75rem 1rem' }}>
                <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                  <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'var(--surface2)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, fontWeight:700, color:'var(--accent2)', fontSize:'0.85rem' }}>
                    {r.authorName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'4px' }}>
                      <span style={{ fontWeight:600, fontSize:'0.88rem' }}>{r.authorName}</span>
                      <span style={{ fontSize:'0.74rem', color:'var(--text3)' }}>{timeAgo(r.postedAt)}</span>
                    </div>
                    <p style={{ fontSize:'0.88rem', color:'var(--text2)', lineHeight:'1.6', margin:0 }}>{r.content}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Add Reply */}
            <form onSubmit={submitReply} className="card" style={{ marginTop:'1rem' }}>
              <h3 style={{ marginBottom:'0.75rem', fontSize:'0.95rem' }}>Add a Reply</h3>
              <textarea className="form-control" rows={3} placeholder="Share your thoughts..." value={replyText} onChange={e => setReplyText(e.target.value)} required />
              <button className="btn btn-primary" type="submit" style={{ marginTop:'10px', width:'auto', padding:'8px 20px' }}>Post Reply</button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
