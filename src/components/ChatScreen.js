import React, { useState } from "react";
export default function ChatScreen({ user }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  function sendMessage(e) {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { from: user.email, text: input }]);
      setInput("");
    }
  }

  return (
  <div style={{ display: "flex", height: "100vh", backgroundImage: 'url(/assets/background.jpg)', backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
          <strong>Bem-vindo, {user.email}</strong>
        </header>
        <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
          {messages.length === 0 ? (
            <div style={{ color: '#64748b' }}>Nenhuma mensagem ainda.</div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} style={{ margin: "8px 0", textAlign: msg.from === user.email ? "right" : "left" }}>
                <span style={{ fontWeight: "bold" }}>{msg.from}:</span> {msg.text}
              </div>
            ))
          )}
        </div>
        <form onSubmit={sendMessage} style={{ display: "flex", padding: 16, borderTop: "1px solid #ddd" }}>
          <input
            style={{ flex: 1, marginRight: 8 }}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Digite sua mensagem..."
          />
          <button type="submit">Enviar</button>
        </form>
      </main>
    </div>
  );
}
