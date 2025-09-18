import React, { useState, useEffect } from 'react';
import { getMessages, postMessage } from '../services/api';

export default function ChatWindow({ contact, me }){
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');

  useEffect(()=>{ if(contact) load(); async function load(){ const m = await getMessages(contact.id); setMessages(m);} },[contact]);

  async function send(){
    if(!text.trim()) return;
    const payload = { sender_id: me.id, receiver_id: contact.id, content: text };
    const res = await postMessage(payload);
    setMessages(prev=>[...prev, res]);
    setText('');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
        {messages.map(m=> (
          <div key={m.id} style={{ marginBottom: 8 }}>
            <div><strong>{m.sender_id === me.id ? 'Você' : contact.name}</strong> <small>{new Date(m.timestamp).toLocaleString()}</small></div>
            <div>{m.content}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: 12, borderTop: '1px solid #eee' }}>
        <textarea value={text} onChange={e=>setText(e.target.value)} style={{ width: '100%', minHeight: 80 }} />
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <button onClick={send} style={{ padding: '8px 16px' }}>Enviar</button>
        </div>
      </div>
    </div>
  );
}
