import React, { useState } from 'react';
import ContactList from '../components/ContactList';
import ChatWindow from '../components/ChatWindow';

export default function AnalystDashboard({ me }){
  const [selected, setSelected] = useState(null);
  return (
    <div style={{ display: 'flex', gap: 16 }}>
      <div style={{ width: 280 }}><ContactList onSelect={setSelected} /></div>
      <div style={{ flex: 1, height: '80vh', border: '1px solid #eee' }}>
        {selected ? <ChatWindow contact={selected} me={me} /> : <div style={{ padding: 16 }}>Selecione um contato</div>}
      </div>
    </div>
  );
}
