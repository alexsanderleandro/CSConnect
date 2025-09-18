import React from 'react';

export default function ContactListImpl({ onSelect }) {
  const items = [
    { id: 'c1', name: 'Contato 1' },
    { id: 'c2', name: 'Contato 2' },
    { id: 'c3', name: 'Contato 3' }
  ];
  return (
    <div style={{ padding: 8 }}>
      <h3 style={{ marginTop: 0 }}>Analistas</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {items.map(i => (
          <div key={i.id} onClick={() => onSelect && onSelect(i)} style={{ padding: 8, borderRadius: 6, background: '#fff', border: '1px solid #eef2ff', cursor: 'pointer' }}>
            <strong>{i.name}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}
