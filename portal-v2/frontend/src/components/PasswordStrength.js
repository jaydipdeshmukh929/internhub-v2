import React, { useMemo } from 'react';

export function getPasswordStrength(password) {
  if (!password) return { score: 0, label: '', color: '', checks: {} };

  const checks = {
    length:    password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number:    /[0-9]/.test(password),
    special:   /[^A-Za-z0-9]/.test(password),
    long:      password.length >= 12,
  };

  const score = Object.values(checks).filter(Boolean).length;

  let label, color, bgColor;
  if (score <= 2) {
    label = 'Weak';
    color = '#ef4444';
    bgColor = 'rgba(239,68,68,0.15)';
  } else if (score <= 3) {
    label = 'Fair';
    color = '#f59e0b';
    bgColor = 'rgba(245,158,11,0.15)';
  } else if (score <= 4) {
    label = 'Good';
    color = '#3b82f6';
    bgColor = 'rgba(59,130,246,0.15)';
  } else {
    label = 'Strong';
    color = '#22c55e';
    bgColor = 'rgba(34,197,94,0.15)';
  }

  return { score, label, color, bgColor, checks };
}

export default function PasswordStrength({ password }) {
  const strength = useMemo(() => getPasswordStrength(password), [password]);

  if (!password) return null;

  const bars = 5;
  const filledBars = Math.min(strength.score, bars);

  const requirements = [
    { key: 'length',    text: 'At least 8 characters' },
    { key: 'uppercase', text: 'One uppercase letter (A-Z)' },
    { key: 'lowercase', text: 'One lowercase letter (a-z)' },
    { key: 'number',    text: 'One number (0-9)' },
    { key: 'special',   text: 'One special character (!@#$...)' },
    { key: 'long',      text: 'At least 12 characters (bonus)' },
  ];

  return (
    <div style={{ marginTop: '8px' }}>
      {/* Strength bars */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
        {Array.from({ length: bars }).map((_, i) => (
          <div key={i} style={{
            flex: 1, height: '4px', borderRadius: '2px',
            background: i < filledBars ? strength.color : 'var(--surface2)',
            transition: 'background 0.3s',
          }} />
        ))}
      </div>

      {/* Label */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <span style={{ fontSize: '0.75rem', color: 'var(--text3)' }}>Password strength</span>
        <span style={{
          fontSize: '0.75rem', fontWeight: 600,
          padding: '2px 8px', borderRadius: '10px',
          background: strength.bgColor, color: strength.color,
        }}>
          {strength.label}
        </span>
      </div>

      {/* Requirements checklist */}
      <div style={{
        background: 'var(--surface2)', borderRadius: '8px',
        padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: '5px',
      }}>
        {requirements.map(r => (
          <div key={r.key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{
              width: '16px', height: '16px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '10px', fontWeight: 700, flexShrink: 0,
              background: strength.checks[r.key] ? 'rgba(34,197,94,0.2)' : 'var(--surface)',
              color: strength.checks[r.key] ? '#22c55e' : 'var(--text3)',
              border: `1px solid ${strength.checks[r.key] ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
              transition: 'all 0.2s',
            }}>
              {strength.checks[r.key] ? '✓' : '·'}
            </span>
            <span style={{
              fontSize: '0.78rem',
              color: strength.checks[r.key] ? 'var(--text2)' : 'var(--text3)',
              transition: 'color 0.2s',
            }}>
              {r.text}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
