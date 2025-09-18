import React, { useEffect, useState } from 'react';
import { getAnalysts } from '../services/api';

export default function ContactList({ onSelect }){
  const [contacts, setContacts] = useState([]);
  useEffect(()=>{ getAnalysts().then(setContacts).catch(()=>setContacts([])); },[]);
  return (
    <div>
      <h3>Analistas</h3>
      {contacts.map(c=> (
        <div key={c.id} style={{ padding: 8, borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={()=>onSelect(c)}>
          <strong>{c.name}</strong>
        </div>
      ))}
    </div>
  );
}
