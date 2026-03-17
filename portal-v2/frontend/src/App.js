import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import useSessionTimeout from './hooks/useSessionTimeout';
import './App.css';

import Login             from './pages/Login';
import Register          from './pages/Register';
import VerifyOtp         from './pages/VerifyOtp';
import ForgotPassword    from './pages/ForgotPassword';
import Home              from './pages/Home';
import Dashboard         from './pages/Dashboard';
import InternshipDetail  from './pages/InternshipDetail';
import MyApplications    from './pages/MyApplications';
import SavedInternships  from './pages/SavedInternships';
import Profile           from './pages/Profile';
import Notifications     from './pages/Notifications';
import StudentFeatures   from './pages/StudentFeatures';
import StudentAnalytics  from './pages/StudentAnalytics';
import Chat              from './pages/Chat';
import Gamification      from './pages/Gamification';
import Announcements     from './pages/Announcements';
import AdminDashboard    from './pages/AdminDashboard';
import AdminApplications from './pages/AdminApplications';
import ManageUsers       from './pages/ManageUsers';
import ManageInternships from './pages/ManageInternships';
import AdminFeatures     from './pages/AdminFeatures';

function SessionManager({ children }) {
  useSessionTimeout();
  return children;
}

const Guard = ({ children, adminOnly }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== 'ADMIN') return <Navigate to="/dashboard" replace />;
  return <SessionManager>{children}</SessionManager>;
};

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/"                element={user ? <Navigate to="/dashboard" /> : <Navigate to="/home" />} />
      <Route path="/home"            element={<Home />} />
      <Route path="/login"           element={<Login />} />
      <Route path="/register"        element={<Register />} />
      <Route path="/verify-otp"      element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/dashboard"       element={<Guard><Dashboard /></Guard>} />
      <Route path="/internship/:id"  element={<Guard><InternshipDetail /></Guard>} />
      <Route path="/my-applications" element={<Guard><MyApplications /></Guard>} />
      <Route path="/saved"           element={<Guard><SavedInternships /></Guard>} />
      <Route path="/profile"         element={<Guard><Profile /></Guard>} />
      <Route path="/notifications"   element={<Guard><Notifications /></Guard>} />
      <Route path="/features"        element={<Guard><StudentFeatures /></Guard>} />
      <Route path="/analytics"       element={<Guard><StudentAnalytics /></Guard>} />
      <Route path="/chat"            element={<Guard><Chat /></Guard>} />
      <Route path="/gamification"    element={<Guard><Gamification /></Guard>} />
      <Route path="/announcements"   element={<Guard><Announcements /></Guard>} />

      <Route path="/admin"                element={<Guard adminOnly><AdminDashboard /></Guard>} />
      <Route path="/admin/applications"   element={<Guard adminOnly><AdminApplications /></Guard>} />
      <Route path="/admin/users"          element={<Guard adminOnly><ManageUsers /></Guard>} />
      <Route path="/admin/internships"    element={<Guard adminOnly><ManageInternships /></Guard>} />
      <Route path="/admin/features"       element={<Guard adminOnly><AdminFeatures /></Guard>} />
      <Route path="/qna"                  element={<Guard adminOnly><AdminQnA /></Guard>} />
    </Routes>
  );
}

// Inline admin Q&A page
function AdminQnA() {
  const [qna, setQna] = React.useState([]);
  const [answers, setAnswers] = React.useState({});
  const { user } = useAuth();
  const { getAllQnA, answerQuestion } = require('./services/api');
  const Navbar = require('./components/Navbar').default;

  React.useEffect(() => {
    getAllQnA().then(r => setQna(r.data)).catch(() => {});
  }, []);

  const submit = async (id) => {
    if (!answers[id]) return;
    await answerQuestion(id, { answer: answers[id], adminName: user.name });
    setAnswers(a => ({ ...a, [id]: '' }));
    getAllQnA().then(r => setQna(r.data)).catch(() => {});
  };

  return (
    <>
      <Navbar />
      <div className="page">
        <h1 className="page-title">Q&A Management</h1>
        {qna.length === 0
          ? <div className="empty-state card"><div className="icon">❓</div><p>No questions yet.</p></div>
          : qna.map(q => (
            <div key={q.id} className="card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                <span style={{ fontSize: '1.2rem' }}>❓</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{q.question}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text3)', marginTop: '3px' }}>
                    {q.questionByName} · {q.companyName} — {q.internshipRole}
                  </div>
                </div>
              </div>
              {q.answer
                ? <div style={{ padding: '10px 12px', background: 'rgba(34,197,94,0.08)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(34,197,94,0.2)', fontSize: '0.88rem', color: 'var(--text2)' }}>
                    <span style={{ color: 'var(--green)', fontWeight: 600 }}>✓ Answered: </span>{q.answer}
                  </div>
                : <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                    <input className="form-control" placeholder="Type your answer..."
                      value={answers[q.id] || ''} onChange={e => setAnswers(a => ({ ...a, [q.id]: e.target.value }))} />
                    <button className="btn btn-primary btn-sm" onClick={() => submit(q.id)}>Answer</button>
                  </div>
              }
            </div>
          ))
        }
      </div>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <AppRoutes />
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}
