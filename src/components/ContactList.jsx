import React from 'react';

let Impl;
try {
  // tenta importar a implementação existente (frontend copy) se disponível
  Impl = require('../../frontend/src/components/ContactList.jsx').default;
} catch (e) {
  // fallback simples
  Impl = function ContactList({ onSelect }){
    return (
      <div>
        <h3>Analistas (fallback)</h3>
        <div style={{ padding: 8, borderBottom: '1px solid #eee', cursor: 'pointer' }} onClick={()=>onSelect({ id: 'c1', name: 'Contato 1' })}>
          <strong>Contato 1</strong>
        </div>
      </div>
    );
  };
}

export default Impl;
