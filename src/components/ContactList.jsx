import React from 'react';

// Avoid importing files outside of src/ (CRA restriction).
// Try to load a local optional implementation (ContactList.impl.jsx) if present
// otherwise fall back to a minimal inline implementation.
let Impl;
try {
  // prefer a local implementation if developer added one
  // eslint-disable-next-line import/no-unresolved
  Impl = require('./ContactList.impl').default;
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
