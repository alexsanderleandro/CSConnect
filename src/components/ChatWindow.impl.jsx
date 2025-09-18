import React from 'react';

export default function ChatWindowImpl({ contact, me }) {
  return (
    <div style={{ padding: 12 }}>
      <h3 style={{ marginTop: 0 }}>Chat</h3>
      <div style={{ fontSize: 14, color: '#334155' }}>Contato: {contact ? contact.name : '—'}</div>
      <div style={{ marginTop: 12, padding: 12, background: '#f8fafc', borderRadius: 8, minHeight: 120 }}>
        <div style={{ color: '#6b7280' }}>Este é um chat de placeholder. Mensagens reais aparecem aqui quando o backend estiver disponível.</div>
        {contact && (
          <div style={{ marginTop: 10, fontSize: 13 }}>
            <strong>Última mensagem simulada:</strong>
            <div style={{ marginTop: 6 }}>Olá, {contact.name}! Esta é uma mensagem de teste.</div>
          </div>
        )}
      </div>
    </div>
  );
}
