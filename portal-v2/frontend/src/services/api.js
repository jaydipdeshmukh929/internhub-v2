import axios from 'axios';

// In production, REACT_APP_API_URL is set to your Railway backend URL
// In development, falls back to localhost:8081
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const API = axios.create({ baseURL: BASE_URL });

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

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

// ── Auth ──────────────────────────────────────────────────────────────────────
export const register           = d => API.post('/auth/register', d);
export const verifyOtp          = d => API.post('/auth/verify-otp', d);
export const login              = d => API.post('/auth/login', d);
export const googleLogin        = d => API.post('/auth/google', d);
export const forgotPassword     = d => API.post('/auth/forgot-password', d);
export const resetPassword      = d => API.post('/auth/reset-password', d);
export const toggle2FA          = () => API.post('/auth/toggle-2fa');
export const verify2FA          = d  => API.post('/auth/verify-2fa', d);
export const getLoginHistory    = () => API.get('/auth/login-history');
export const requestDeletion    = () => API.post('/auth/request-deletion');
export const cancelDeletion     = () => API.post('/auth/cancel-deletion');

// ── Internships ───────────────────────────────────────────────────────────────
export const getAllInternships   = ()       => API.get('/internships/all');
export const getLatest          = ()       => API.get('/internships/latest');
export const getTrending        = ()       => API.get('/internships/trending');
export const advancedSearch     = p        => API.get('/internships/search', { params: p });
export const getInternshipById  = id       => API.get(`/internships/${id}`);
export const getSimilar         = id       => API.get(`/internships/similar/${id}`);
export const addInternship      = d        => API.post('/internships/add', d);
export const updateInternship   = (id, d)  => API.put(`/internships/update/${id}`, d);
export const deleteInternship   = id       => API.delete(`/internships/delete/${id}`);
export const toggleBookmark     = d        => API.post('/internships/bookmark', d);
export const getSavedInternships= e        => API.get(`/internships/saved/${e}`);
export const getCompanyAnalytics= ()       => API.get('/internships/company-analytics');

// ── Applications ──────────────────────────────────────────────────────────────
export const applyToInternship   = d       => API.post('/applications/apply', d);
export const getAllApplications   = ()     => API.get('/applications/all');
export const getMyApplications   = e      => API.get(`/applications/student/${e}`);
export const updateAppStatus     = (id, d) => API.put(`/applications/status/${id}`, d);
export const scheduleInterview   = (id, d) => API.post(`/applications/interview/${id}`, d);
export const withdrawApplication = (id, d) => API.put(`/applications/withdraw/${id}`, d);
export const getAnalytics        = ()      => API.get('/applications/analytics');

// ── Users ─────────────────────────────────────────────────────────────────────
export const getUserByEmail      = e       => API.get(`/users/${e}`);
export const getAllUsers         = ()      => API.get('/users/all');
export const updateProfile      = d       => API.put('/users/update', d);
export const banUser            = (id, d) => API.put(`/users/ban/${id}`, d);
export const changePassword     = d       => API.put('/users/change-password', d);
export const deleteAccount      = d       => API.delete('/users/delete-account', { data: d });
export const uploadResume       = (email, file) => {
  const fd = new FormData(); fd.append('email', email); fd.append('file', file);
  return API.post('/users/upload-resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const uploadPhoto        = (email, file) => {
  const fd = new FormData(); fd.append('email', email); fd.append('file', file);
  return API.post('/users/upload-photo', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};

// ── Notifications ─────────────────────────────────────────────────────────────
export const getNotifications   = e  => API.get(`/notifications/${e}`);
export const getUnreadCount     = e  => API.get(`/notifications/unread/${e}`);
export const markAllRead        = e  => API.put(`/notifications/mark-read/${e}`);

// ── Reviews ───────────────────────────────────────────────────────────────────
export const addReview          = d  => API.post('/reviews/add', d);
export const getCompanyReviews  = c  => API.get(`/reviews/company/${encodeURIComponent(c)}`);

// ── Student Features ──────────────────────────────────────────────────────────
export const scoreResume        = (email, file) => {
  const fd = new FormData(); fd.append('email', email); fd.append('file', file);
  return API.post('/student/resume-score', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
};
export const getRecommendations = e   => API.get(`/student/recommendations/${e}`);
export const getBadges          = e   => API.get(`/student/badges/${e}`);
export const getReferralInfo    = e   => API.get(`/student/referral/${e}`);
export const applyReferralCode  = d   => API.post('/student/referral/apply', d);
export const uploadCertificate  = fd  => API.post('/student/certificate/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getCertificates    = e   => API.get(`/student/certificates/${e}`);
export const updatePortfolio    = d   => API.put('/student/portfolio', d);

// ── Admin Features ────────────────────────────────────────────────────────────
export const saveCompanyProfile      = d    => API.post('/admin/company/save', d);
export const getAllCompanies         = ()   => API.get('/admin/company/all');
export const getCompanyProfile      = name => API.get(`/companies/${encodeURIComponent(name)}`);
export const importExcel            = file => { const fd = new FormData(); fd.append('file', file); return API.post('/admin/import/excel', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); };
export const importCsv              = file => { const fd = new FormData(); fd.append('file', file); return API.post('/admin/import/csv', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); };
export const exportApplicationsExcel= status => API.get('/admin/export/applications', { params: { status }, responseType: 'blob' });
export const getEmailTemplates      = ()   => API.get('/admin/templates');
export const saveEmailTemplate      = d    => API.post('/admin/templates/save', d);

// ── Analytics ─────────────────────────────────────────────────────────────────
export const getStudentAnalytics    = e  => API.get(`/analytics/student/${e}`);
export const getAdminAnalytics      = () => API.get('/analytics/admin');
export const getFunnelAnalytics     = () => API.get('/analytics/advanced/funnel');
export const getTimeHireAnalytics   = () => API.get('/analytics/advanced/time-hire');
export const getCohortAnalytics     = () => API.get('/analytics/advanced/cohort');

// ── Communication ─────────────────────────────────────────────────────────────
export const sendChatMessage        = d        => API.post('/chat/send', d);
export const getChatMessages        = (e1, e2) => API.get('/chat/messages', { params: { email1: e1, email2: e2 } });
export const getChatContacts        = e        => API.get(`/chat/contacts/${e}`);
export const getChatUnread          = e        => API.get(`/chat/unread/${e}`);
export const askQuestion            = d        => API.post('/qna/ask', d);
export const answerQuestion         = (id, d)  => API.put(`/qna/answer/${id}`, d);
export const getQnA                 = id       => API.get(`/qna/internship/${id}`);
export const getAllQnA              = ()       => API.get('/qna/all');
export const getAnnouncements       = ()       => API.get('/announcements');
export const getAllAnnouncements    = ()       => API.get('/announcements/all');
export const postAnnouncement       = d        => API.post('/announcements', d);
export const deleteAnnouncement     = id       => API.delete(`/announcements/${id}`);
export const pinAnnouncement        = id       => API.put(`/announcements/pin/${id}`);

// ── Gamification ──────────────────────────────────────────────────────────────
export const getGamificationProfile = e  => API.get(`/gamification/profile/${e}`);
export const getLeaderboard         = () => API.get('/gamification/leaderboard');

// ── AI Features ───────────────────────────────────────────────────────────────
export const generateCoverLetter    = d    => API.post('/ai/cover-letter', d);
export const getInterviewPrep       = id   => API.get('/ai/interview-prep', { params: { internshipId: id } });
export const getJobMatchScore       = id   => API.get('/ai/job-match', { params: { internshipId: id } });
export const parseResume            = file => { const fd = new FormData(); fd.append('file', file); return API.post('/ai/parse-resume', fd, { headers: { 'Content-Type': 'multipart/form-data' } }); };
export const chatbotMessage         = msg  => API.post('/ai/chat', { message: msg });

// ── Admin Invite ──────────────────────────────────────────────────────────────
export const sendInvite      = d      => API.post('/admin-invite/send', d);
export const validateInvite  = token  => API.get(`/admin-invite/validate/${token}`);
export const registerAdmin   = d      => API.post('/admin-invite/register', d);
export const getAllInvites    = ()     => API.get('/admin-invite/all');
export const revokeInvite    = id     => API.delete(`/admin-invite/revoke/${id}`);

// ── Discovery ─────────────────────────────────────────────────────────────────
export const addSearchHistory    = d      => API.post('/discovery/search-history', d);
export const getSearchHistory    = ()     => API.get('/discovery/search-history');
export const clearSearchHistory  = ()     => API.delete('/discovery/search-history');
export const saveFilterPreset    = d      => API.post('/discovery/save-filter', d);
export const getSavedFilters2    = ()     => API.get('/discovery/saved-filters');
export const deleteFilterPreset  = name  => API.delete(`/discovery/saved-filters/${encodeURIComponent(name)}`);
export const searchBySkill       = skill => API.get(`/discovery/skill/${encodeURIComponent(skill)}`);
export const toggleFollowCompany = d      => API.post('/discovery/follow-company', d);
export const getFollowedCompanies= ()     => API.get('/discovery/followed-companies');
export const getAlumniNetwork    = ()     => API.get('/discovery/alumni');
export const getMapInternships   = ()     => API.get('/discovery/map');

// ── Documents ─────────────────────────────────────────────────────────────────
export const genCertificate  = d => API.post('/documents/certificate', d);
export const genOfferLetter  = d => API.post('/documents/offer-letter', d);
export const genNOC          = d => API.post('/documents/noc', d);

// ── Discussions ───────────────────────────────────────────────────────────────
export const getDiscussions     = cat    => API.get('/discussions', { params: { category: cat } });
export const createDiscussion   = d      => API.post('/discussions', d);
export const getDiscussion      = id     => API.get(`/discussions/${id}`);
export const replyDiscussion    = (id,d) => API.post(`/discussions/${id}/reply`, d);
export const likeDiscussion     = id     => API.post(`/discussions/${id}/like`);
export const deleteDiscussion   = id     => API.delete(`/discussions/${id}`);

// ── Public Profile ────────────────────────────────────────────────────────────
export const enablePublicProfile  = () => API.post('/profile/enable-public');
export const disablePublicProfile = () => API.post('/profile/disable-public');
export const getPublicProfile     = slug => API.get(`/student/${slug}`);
export const activatePremium      = months => API.post('/profile/premium', { months });
export const markAlumni           = completedAt => API.post('/profile/mark-alumni', { completedAt });

export default API;
