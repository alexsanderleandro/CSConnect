import React from 'react';

// Avoid importing files outside of src/ (CRA restriction).
// Try to load a local optional implementation (ChatWindow.impl.jsx) if present
// otherwise fall back to a minimal inline implementation.
let Impl;
try {
  // prefer a local implementation if developer added one
  // eslint-disable-next-line import/no-unresolved
  Impl = require('./ChatWindow.impl').default;
} catch (e) {
  Impl = function ChatWindow({ contact, me }) {
    return <div>Chat (fallback) with {contact ? contact.name : '—'}</div>;
  };
}

export default Impl;
