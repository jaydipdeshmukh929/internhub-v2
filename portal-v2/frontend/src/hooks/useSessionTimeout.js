import { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const TIMEOUT_DURATION = 30 * 60 * 1000;   // 30 minutes idle = auto logout
const WARNING_BEFORE   =  2 * 60 * 1000;   // show warning 2 minutes before logout
const EVENTS = ['mousedown','mousemove','keydown','scroll','touchstart','click'];

export default function useSessionTimeout() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const logoutTimer  = useRef(null);
  const warningTimer = useRef(null);
  const warningShown = useRef(false);

  const clearTimers = useCallback(() => {
    if (logoutTimer.current)  clearTimeout(logoutTimer.current);
    if (warningTimer.current) clearTimeout(warningTimer.current);
  }, []);

  const removeWarning = () => {
    const el = document.getElementById('session-warning');
    if (el) el.remove();
    warningShown.current = false;
  };

  const showWarning = useCallback(() => {
    if (warningShown.current) return;
    warningShown.current = true;

    const div = document.createElement('div');
    div.id = 'session-warning';
    div.innerHTML = `
      <div style="
        position:fixed; bottom:24px; right:24px; z-index:9999;
        background:#1a1a24; border:1px solid rgba(245,158,11,0.5);
        border-radius:14px; padding:16px 20px; width:300px;
        box-shadow:0 8px 32px rgba(0,0,0,0.5);
        animation: slideIn 0.3s ease;
      ">
        <style>
          @keyframes slideIn { from { transform:translateY(20px); opacity:0; } to { transform:translateY(0); opacity:1; } }
          #session-warning button:hover { opacity:0.85; }
        </style>
        <div style="display:flex; align-items:center; gap:10px; margin-bottom:10px;">
          <span style="font-size:1.3rem;">⚠️</span>
          <div>
            <div style="font-weight:600; font-size:0.9rem; color:#f0f0f8; font-family:Syne,sans-serif;">Session Expiring</div>
            <div style="font-size:0.78rem; color:#9090b0; margin-top:2px;">You'll be logged out in 2 minutes due to inactivity.</div>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button id="session-stay" style="
            flex:1; padding:8px; border:none; border-radius:8px;
            background:#7c6bff; color:white; font-size:0.82rem;
            font-weight:600; cursor:pointer;
          ">Stay Logged In</button>
          <button id="session-logout" style="
            flex:1; padding:8px; border:1px solid rgba(255,255,255,0.1);
            border-radius:8px; background:transparent; color:#9090b0;
            font-size:0.82rem; cursor:pointer;
          ">Logout Now</button>
        </div>
      </div>
    `;
    document.body.appendChild(div);

    document.getElementById('session-stay')?.addEventListener('click', () => {
      removeWarning();
      resetTimers();
    });
    document.getElementById('session-logout')?.addEventListener('click', () => {
      removeWarning();
      handleLogout();
    });
  }, []);

  const handleLogout = useCallback(() => {
    removeWarning();
    clearTimers();
    signOut();
    navigate('/login');
  }, [signOut, navigate, clearTimers]);

  const resetTimers = useCallback(() => {
    clearTimers();
    removeWarning();

    warningTimer.current = setTimeout(() => {
      showWarning();
    }, TIMEOUT_DURATION - WARNING_BEFORE);

    logoutTimer.current = setTimeout(() => {
      handleLogout();
    }, TIMEOUT_DURATION);
  }, [clearTimers, showWarning, handleLogout]);

  useEffect(() => {
    if (!user) return;

    resetTimers();

    const handleActivity = () => resetTimers();
    EVENTS.forEach(e => window.addEventListener(e, handleActivity, { passive: true }));

    return () => {
      clearTimers();
      removeWarning();
      EVENTS.forEach(e => window.removeEventListener(e, handleActivity));
    };
  }, [user, resetTimers, clearTimers]);
}
