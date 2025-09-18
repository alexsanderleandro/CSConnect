import React, { useEffect, useState } from 'react';
import { getSectors, createAttendance } from '../services/api';

export default function ClientChatBot({ me }){
  const [sectors, setSectors] = useState([]);
  const [selected, setSelected] = useState(null);
  const [msg, setMsg] = useState('');
  useEffect(()=>{ getSectors().then(setSectors).catch(()=>setSectors([])); },[]);

  async function sendToQueue(){
    if(!selected) return alert('Escolha um setor');
    const payload = { client_id: me.id, sector_id: selected, status: 'waiting' };
    const res = await createAttendance(payload);
    alert('Você entrou na fila. Id: '+res.id);
  }

  return (
    <div>
      <h3>Atendimento ao Cliente</h3>
      <select value={selected||''} onChange={e=>setSelected(Number(e.target.value))}>
        <option value="">Selecione um setor</option>
        {sectors.map(s=> <option key={s.id} value={s.id}>{s.name}</option>)}
      </select>
      <div>
        <textarea value={msg} onChange={e=>setMsg(e.target.value)} placeholder="Descreva seu problema" />
        <div><button onClick={sendToQueue}>Entrar na fila</button></div>
      </div>
    </div>
  );
}
