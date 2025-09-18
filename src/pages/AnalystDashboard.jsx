import React, { useState } from 'react';
import ContactList from '../components/ContactList';
import ChatWindow from '../components/ChatWindow';
import './AnalystDashboard.css';

export default function AnalystDashboard({ me }){
  const [selected, setSelected] = useState(null);
  return (
    <div className="analyst-shell">
      <div className="analyst-sidebar"><ContactList onSelect={setSelected} /></div>
      <div className="analyst-main">
        {selected ? <ChatWindow contact={selected} me={me} /> : <div style={{ padding: 16 }}>Selecione um contato</div>}
      </div>
    </div>
  );
}
