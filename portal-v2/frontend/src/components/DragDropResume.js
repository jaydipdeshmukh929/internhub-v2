import React, { useState, useRef } from 'react';

export default function DragDropResume({ onFileSelect, label = 'Resume' }) {
  const [dragging, setDragging] = useState(false);
  const [file, setFile]         = useState(null);
  const inputRef                = useRef();

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) { setFile(f); onFileSelect(f); }
  };

  const handleChange = (e) => {
    const f = e.target.files[0];
    if (f) { setFile(f); onFileSelect(f); }
  };

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      style={{
        border: `2px dashed ${dragging ? 'var(--accent)' : file ? 'var(--green)' : 'var(--border2)'}`,
        borderRadius: 'var(--radius)',
        padding: '2rem',
        textAlign: 'center',
        cursor: 'pointer',
        background: dragging ? 'rgba(124,107,255,0.05)' : file ? 'rgba(34,197,94,0.04)' : 'var(--surface2)',
        transition: 'all 0.2s',
        userSelect: 'none',
      }}>
      <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,.txt"
        onChange={handleChange} style={{ display: 'none' }} />
      <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
        {file ? '✅' : dragging ? '📂' : '📄'}
      </div>
      <div style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '4px',
        color: file ? 'var(--green)' : 'var(--text)' }}>
        {file ? file.name : `Drop your ${label} here`}
      </div>
      <div style={{ fontSize: '0.78rem', color: 'var(--text3)' }}>
        {file
          ? `${(file.size / 1024).toFixed(1)} KB — click to change`
          : 'or click to browse — PDF, DOC, DOCX, TXT'}
      </div>
      {file && (
        <button onClick={e => { e.stopPropagation(); setFile(null); onFileSelect(null); }}
          style={{ marginTop: '10px', background: 'none', border: 'none', color: 'var(--red)',
            cursor: 'pointer', fontSize: '0.82rem' }}>
          × Remove
        </button>
      )}
    </div>
  );
}
