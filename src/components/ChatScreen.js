import React, { useState } from "react";

const mockUsers = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Carol" }
];

export default function ChatScreen({ user }) {
  const [selectedUser, setSelectedUser] = useState(mockUsers[0]);
  const [messages, setMessages] = useState([
    { from: "Alice", text: "Olá!" },
    { from: user.email, text: "Oi Alice!" }
  ]);
  const [input, setInput] = useState("");

  function sendMessage(e) {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { from: user.email, text: input }]);
      setInput("");
    }
  }

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <aside style={{ width: 180, background: "#f0f0f0", padding: 16 }}>
        <h3>Usuários</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {mockUsers.map(u => (
            <li key={u.id} style={{ margin: "8px 0", cursor: "pointer", fontWeight: selectedUser.id === u.id ? "bold" : "normal" }} onClick={() => setSelectedUser(u)}>
              {u.name}
            </li>
          ))}
        </ul>
      </aside>
      <main style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <header style={{ padding: 16, borderBottom: "1px solid #ddd" }}>
          <strong>Conversando com: {selectedUser.name}</strong>
        </header>
        <div style={{ flex: 1, padding: 16, overflowY: "auto" }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ margin: "8px 0", textAlign: msg.from === user.email ? "right" : "left" }}>
              <span style={{ fontWeight: "bold" }}>{msg.from}:</span> {msg.text}
            </div>
          ))}
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
