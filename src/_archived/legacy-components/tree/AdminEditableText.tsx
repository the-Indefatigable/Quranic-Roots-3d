import React, { useState } from 'react';
import { useStore } from '../../store/useStore';

/** Inline-editable text field that only activates in admin mode. */
export const AdminEditableText: React.FC<{
  value: string;
  onSave: (newValue: string) => void;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  isArabic?: boolean;
}> = ({ value, onSave, style, inputStyle, isArabic }) => {
  const isAdmin = useStore(s => s.isAdmin);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);

  if (!isAdmin) {
    return <span style={style}>{value}</span>;
  }

  if (editing) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { onSave(draft); setEditing(false); }
            if (e.key === 'Escape') { setDraft(value); setEditing(false); }
          }}
          autoFocus
          style={{
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(34,197,94,0.4)',
            borderRadius: '6px',
            color: '#fff',
            padding: '2px 8px',
            fontSize: 'inherit',
            fontFamily: isArabic ? "'Scheherazade New', serif" : 'inherit',
            direction: isArabic ? 'rtl' : 'ltr',
            outline: 'none',
            minWidth: '80px',
            ...inputStyle,
          }}
        />
        <button onClick={() => { onSave(draft); setEditing(false); }} style={{ background: 'rgba(34,197,94,0.2)', border: 'none', color: '#22c55e', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontSize: '11px' }}>OK</button>
        <button onClick={() => { setDraft(value); setEditing(false); }} style={{ background: 'rgba(255,255,255,0.05)', border: 'none', color: '#888', borderRadius: '4px', padding: '2px 6px', cursor: 'pointer', fontSize: '11px' }}>X</button>
      </span>
    );
  }

  return (
    <span
      onClick={() => { setDraft(value); setEditing(true); }}
      style={{
        ...style,
        cursor: 'pointer',
        borderBottom: '1px dashed rgba(34,197,94,0.4)',
        paddingBottom: '1px',
      }}
      title="Click to edit"
    >
      {value}
    </span>
  );
};
