import React, { useState } from "react";
import LoginScreen from "./components/LoginScreen";
import RegisterScreen from "./components/RegisterScreen";
import ChatScreen from "./components/ChatScreen";
import UsersList from "./components/UsersList";

import { AuthContext } from './contexts/AuthContext';

export default function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [showRegister, setShowRegister] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  if (!user) {
    return (
      <AuthContext.Provider value={{ user, token, isAdmin, setUser, setToken, setIsAdmin }}>
        <div>
          {showRegister
            ? <RegisterScreen onRegistered={() => setShowRegister(false)} />
            : <LoginScreen onLogin={(email, password, tipo, tkn) => {
                setUser({ email, password });
                setIsAdmin(tipo === 'admin');
                setToken(tkn || null);
                // não persistimos mais em localStorage; estado mantido em contexto
              }} onRegister={() => setShowRegister(true)} />}
          <UsersList />
        </div>
      </AuthContext.Provider>
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
                onClick={() => { setUser(null); setIsAdmin(false); setToken(null); }}
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
            <AdminUsers user={user} isAdmin={isAdmin} />
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
          onClick={() => { setUser(null); setToken(null); }}
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
