import React, { useState } from 'react';
import { createGroup } from '../services/api';

export default function GroupManagement(){
  const [name, setName] = useState('');
  async function create(){
    // placeholder: call API
    alert('Criar grupo: '+name);
  }
  return (
    <div>
      <h3>Gerenciar Grupos</h3>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nome do grupo" />
      <button onClick={create}>Criar</button>
    </div>
  );
}
