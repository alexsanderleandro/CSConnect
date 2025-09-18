import React from 'react';

let Impl;
try {
  Impl = require('../../frontend/src/components/ChatWindow.jsx').default;
} catch (e) {
  Impl = function ChatWindow({ contact, me }){
    return <div>Chat (fallback) with {contact ? contact.name : '—'}</div>;
  };
}

export default Impl;
