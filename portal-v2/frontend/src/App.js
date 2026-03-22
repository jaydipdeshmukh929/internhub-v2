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
import AIFeatures        from './pages/AIFeatures';
import SecuritySettings  from './pages/SecuritySettings';
import Documents         from './pages/Documents';
import DiscussionForum   from './pages/DiscussionForum';
import PublicProfile     from './pages/PublicProfile';
import AdminDashboard    from './pages/AdminDashboard';
import AdminApplications from './pages/AdminApplications';
import ManageUsers       from './pages/ManageUsers';
import ManageInternships from './pages/ManageInternships';
import AdminFeatures     from './pages/AdminFeatures';
import AdminProfile      from './pages/AdminProfile';
import AdminRegister     from './pages/AdminRegister';
import AdvancedAnalytics from './pages/AdvancedAnalytics';

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
      {/* Public */}
      <Route path="/"                element={user ? <Navigate to="/dashboard" /> : <Navigate to="/home" />} />
      <Route path="/home"            element={<Home />} />
      <Route path="/login"           element={<Login />} />
      <Route path="/register"        element={<Register />} />
      <Route path="/verify-otp"      element={<VerifyOtp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin-register"  element={<AdminRegister />} />
      <Route path="/student/:slug"   element={<PublicProfile />} />

      {/* Student */}
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
      <Route path="/ai"              element={<Guard><AIFeatures /></Guard>} />
      <Route path="/security"        element={<Guard><SecuritySettings /></Guard>} />
      <Route path="/documents"       element={<Guard><Documents /></Guard>} />
      <Route path="/forum"           element={<Guard><DiscussionForum /></Guard>} />

      {/* Admin */}
      <Route path="/admin"                    element={<Guard adminOnly><AdminDashboard /></Guard>} />
      <Route path="/admin/applications"       element={<Guard adminOnly><AdminApplications /></Guard>} />
      <Route path="/admin/users"              element={<Guard adminOnly><ManageUsers /></Guard>} />
      <Route path="/admin/internships"        element={<Guard adminOnly><ManageInternships /></Guard>} />
      <Route path="/admin/features"           element={<Guard adminOnly><AdminFeatures /></Guard>} />
      <Route path="/admin/profile"            element={<Guard adminOnly><AdminProfile /></Guard>} />
      <Route path="/admin/analytics/advanced" element={<Guard adminOnly><AdvancedAnalytics /></Guard>} />
    </Routes>
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
