import React, { useState } from "react";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import ChatScreen from "./components/ChatScreen";
import UsersList from "./components/UsersList";

export default function App() {
  const [user, setUser] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // Modal/tela de login admin
  function handleAdminLogin(email, password) {
    if (!email.endsWith("@ceosoftware.com.br")) {
      alert("Apenas e-mails do domínio ceosoftware.com.br podem acessar o painel administrativo.");
      return;
    }
    fetch("/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        if (data.token) {
          setUser({ email, token: data.token });
          setIsAdmin(true);
          setShowAdminLogin(false);
        } else {
          alert(data.error || "Login inválido");
        }
      })
      .catch(err => alert("Erro de conexão: " + err.message));
  }

  if (!user) {
    return (
      <div>
        {/* Botão de engrenagem para login admin */}
        <div style={{ position: 'absolute', top: 24, right: 32 }}>
          <button
            title="Painel Administrativo"
            style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28 }}
            onClick={() => setShowAdminLogin(true)}
          >
            <span role="img" aria-label="Engrenagem">⚙️</span>
          </button>
        </div>
        {showRegister
          ? <RegisterScreen onRegistered={() => setShowRegister(false)} />
          : <LoginScreen onLogin={setUser} onRegister={() => setShowRegister(true)} />}
        <UsersList />
        {/* Modal/tela de login admin */}
        {showAdminLogin && (
          <div style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999
          }}>
            <div style={{ background: '#fff', padding: 32, borderRadius: 12, minWidth: 320, boxShadow: '0 4px 24px #0002' }}>
              <h2 style={{ fontSize: 24, marginBottom: 16 }}>Login Administrador</h2>
              <AdminLoginForm onLogin={handleAdminLogin} onClose={() => setShowAdminLogin(false)} />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Se admin logado, mostra painel admin
  if (isAdmin) {
    const AdminUsers = require('./components/AdminUsers').default;
    const AdminDepartamentos = require('./components/AdminDepartamentos').default;
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '16px 32px 0 0' }}>
          <button
            onClick={() => { setUser(null); setIsAdmin(false); }}
            style={{
              fontSize: 18,
              padding: '8px 20px',
              borderRadius: 6,
              background: '#e0e7ff',
              color: '#334155',
              border: 'none',
              fontWeight: 'bold',
              boxShadow: '0 2px 8px #cbd5e1',
              cursor: 'pointer'
            }}
          >Sair</button>
        </div>
        {/* Painel administrativo */}
        <div style={{ display: 'flex', gap: 32, padding: 32 }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 28, marginBottom: 16 }}>Administração de Usuários</h2>
            <AdminUsers />
          </div>
          <div style={{ flex: 1 }}>
            <h2 style={{ fontSize: 28, marginBottom: 16 }}>Administração de Departamentos</h2>
            <AdminDepartamentos />
          </div>
        </div>
      </div>
    );
  }
  // Usuário comum logado
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', padding: '16px 32px 0 0' }}>
        <button
          onClick={() => setUser(null)}
          style={{
            fontSize: 18,
            padding: '8px 20px',
            borderRadius: 6,
            background: '#e0e7ff',
            color: '#334155',
            border: 'none',
            fontWeight: 'bold',
            boxShadow: '0 2px 8px #cbd5e1',
            cursor: 'pointer'
          }}
        >Sair</button>
      </div>
      <ChatScreen user={user} />
      <UsersList />
    </div>
  );
}

// Formulário de login admin
function AdminLoginForm({ onLogin, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <form onSubmit={e => { e.preventDefault(); onLogin(email, password); }} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <label>E-mail (ceosoftware)</label>
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Seu e-mail @ceosoftware.com.br" style={{ fontSize: 18, padding: 10, borderRadius: 6, border: '1px solid #ccc' }} />
      <label>Senha</label>
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Senha" style={{ fontSize: 18, padding: 10, borderRadius: 6, border: '1px solid #ccc' }} />
      <div style={{ display: 'flex', gap: 12 }}>
        <button type="submit" style={{ fontSize: 18, padding: '8px 20px', borderRadius: 6 }}>Entrar</button>
        <button type="button" onClick={onClose} style={{ fontSize: 18, padding: '8px 20px', borderRadius: 6, background: '#eee' }}>Cancelar</button>
      </div>
    </form>
  );
}
