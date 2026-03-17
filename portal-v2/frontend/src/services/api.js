import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:8081/api' });

// Attach JWT token to every request automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auto logout on 401
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────
export const register        = d => API.post('/auth/register', d);
export const verifyOtp       = d => API.post('/auth/verify-otp', d);
export const login           = d => API.post('/auth/login', d);
export const googleLogin     = d => API.post('/auth/google', d);
export const forgotPassword  = d => API.post('/auth/forgot-password', d);
export const resetPassword   = d => API.post('/auth/reset-password', d);

// ── Internships ───────────────────────────────────────
export const getAllInternships   = ()      => API.get('/internships/all');
export const getLatest          = ()      => API.get('/internships/latest');
export const searchInternships  = p       => API.get('/internships/search', { params: p });
export const getInternshipById  = id      => API.get(`/internships/${id}`);
export const addInternship      = d       => API.post('/internships/add', d);
export const updateInternship   = (id, d) => API.put(`/internships/update/${id}`, d);
export const deleteInternship   = id      => API.delete(`/internships/delete/${id}`);
export const toggleBookmark     = d       => API.post('/internships/bookmark', d);
export const getSavedInternships= e       => API.get(`/internships/saved/${e}`);

// ── Applications ──────────────────────────────────────
export const applyToInternship   = d       => API.post('/applications/apply', d);
export const getAllApplications   = ()      => API.get('/applications/all');
export const getMyApplications   = e       => API.get(`/applications/student/${e}`);
export const updateAppStatus     = (id, d) => API.put(`/applications/status/${id}`, d);
export const scheduleInterview   = (id, d) => API.post(`/applications/interview/${id}`, d);
export const withdrawApplication = (id, d) => API.put(`/applications/withdraw/${id}`, d);
export const getAnalytics        = ()      => API.get('/applications/analytics');

// ── Users ─────────────────────────────────────────────
export const getUserByEmail  = e       => API.get(`/users/${e}`);
export const getAllUsers      = ()      => API.get('/users/all');
export const updateProfile   = d       => API.put('/users/update', d);
export const banUser         = (id, d) => API.put(`/users/ban/${id}`, d);
export const uploadResume    = (email, file) => {
  const fd = new FormData(); fd.append('email', email); fd.append('file', file);
  return API.post('/users/upload-resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const uploadPhoto = (email, file) => {
  const fd = new FormData(); fd.append('email', email); fd.append('file', file);
  return API.post('/users/upload-photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// ── Notifications ─────────────────────────────────────
export const getNotifications = e => API.get(`/notifications/${e}`);
export const getUnreadCount   = e => API.get(`/notifications/unread/${e}`);
export const markAllRead      = e => API.put(`/notifications/mark-read/${e}`);

// ── Reviews ───────────────────────────────────────────
export const addReview         = d => API.post('/reviews/add', d);
export const getCompanyReviews = c => API.get(`/reviews/company/${encodeURIComponent(c)}`);

// ── Student Features ──────────────────────────────────
export const scoreResume        = (email, file) => {
  const fd = new FormData(); fd.append('email', email); fd.append('file', file);
  return API.post('/student/resume-score', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const getRecommendations = e   => API.get(`/student/recommendations/${e}`);
export const getBadges          = e   => API.get(`/student/badges/${e}`);
export const getReferralInfo    = e   => API.get(`/student/referral/${e}`);
export const applyReferralCode  = d   => API.post('/student/referral/apply', d);
export const uploadCertificate  = fd  => API.post('/student/certificate/upload', fd, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
export const getCertificates    = e   => API.get(`/student/certificates/${e}`);
export const updatePortfolio    = d   => API.put('/student/portfolio', d);

// ── Admin Features ────────────────────────────────────
export const saveCompanyProfile      = d      => API.post('/admin/company/save', d);
export const getAllCompanies          = ()     => API.get('/admin/company/all');
export const getCompanyProfile       = name   => API.get(`/companies/${encodeURIComponent(name)}`);
export const importExcel             = file   => {
  const fd = new FormData(); fd.append('file', file);
  return API.post('/admin/import/excel', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const importCsv               = file   => {
  const fd = new FormData(); fd.append('file', file);
  return API.post('/admin/import/csv', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const exportApplicationsExcel = status => API.get('/admin/export/applications', {
  params: { status }, responseType: 'blob'
});
export const getEmailTemplates       = ()     => API.get('/admin/templates');
export const saveEmailTemplate       = d      => API.post('/admin/templates/save', d);

export default API;

// Discovery & Analytics
export const advancedSearch      = p => API.get('/internships/search', { params: p });
export const getTrending         = () => API.get('/internships/trending');
export const getSimilar          = id => API.get(`/internships/similar/${id}`);
export const getStudentAnalytics = e  => API.get(`/analytics/student/${e}`);
export const getAdminAnalytics   = () => API.get('/analytics/admin');
export const getCompanyAnalytics = () => API.get('/internships/company-analytics');

// Communication
export const sendChatMessage    = d      => API.post('/chat/send', d);
export const getChatMessages    = (e1,e2)=> API.get('/chat/messages', { params:{ email1:e1, email2:e2 }});
export const getChatContacts    = e      => API.get(`/chat/contacts/${e}`);
export const getChatUnread      = e      => API.get(`/chat/unread/${e}`);
export const askQuestion        = d      => API.post('/qna/ask', d);
export const answerQuestion     = (id,d) => API.put(`/qna/answer/${id}`, d);
export const getQnA             = id     => API.get(`/qna/internship/${id}`);
export const getAllQnA          = ()     => API.get('/qna/all');
export const getAnnouncements   = ()     => API.get('/announcements');
export const getAllAnnouncements = ()     => API.get('/announcements/all');
export const postAnnouncement   = d      => API.post('/announcements', d);
export const deleteAnnouncement = id     => API.delete(`/announcements/${id}`);
export const pinAnnouncement    = id     => API.put(`/announcements/pin/${id}`);

// Gamification
export const getGamificationProfile = e => API.get(`/gamification/profile/${e}`);
export const getLeaderboard         = () => API.get('/gamification/leaderboard');
