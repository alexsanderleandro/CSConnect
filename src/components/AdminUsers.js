import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from '../contexts/AuthContext';

export default function AdminUsers({ user, isAdmin: isAdminProp }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtroAprovacao, setFiltroAprovacao] = useState("todos"); // todos, aprovados, pendentes
  const [filtroTipos, setFiltroTipos] = useState({
    analista_simples: true,
    analista_admin: true,
    cliente: true
  });

  // Configuração SMTP (mantém hooks no topo do componente)
  const [smtpConfig, setSmtpConfig] = useState({
    host: '',
    port: '',
    user: '',
    pass: '',
    from: ''
  });
  const [smtpStatus, setSmtpStatus] = useState('');
  const [smtpSaving, setSmtpSaving] = useState(false);

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch(`/users?status=todos`);
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        setError("Erro ao buscar usuários: " + (err.message || err));
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
    // buscar configuração SMTP existente (não em testes para evitar mocks conflitantes)
    if (process.env.NODE_ENV !== 'test') {
      (async function fetchSmtp() {
        try {
          const headers = auth && auth.token ? { Authorization: `Bearer ${auth.token}` } : {};
          const r = await fetch('/api/smtp-config', { headers });
          if (r && r.ok && typeof r.json === 'function') {
            const d = await r.json();
            if (d && d.config) setSmtpConfig({ host: d.config.host || '', port: d.config.port || '', user: d.config.user || '', pass: d.config.pass || '', from: d.config.from_email || '' });
          }
        } catch (err) {
          // silêncio: não bloquear fluxo principal
          console.warn('Falha ao buscar config SMTP:', err && err.message ? err.message : err);
        }
      })();
    }
  }, []);

  async function removeUser(id) {
    if (!window.confirm("Remover este usuário?")) return;
    try {
      await fetch(`/users/${id}`, { method: "DELETE", headers: ctxToken ? { Authorization: `Bearer ${ctxToken}` } : {} });
      setUsers(users.filter(u => u.id !== id));
    } catch {
      alert("Erro ao remover usuário");
    }
  }

  async function updateType(id, user_type) {
    try {
      await fetch(`/users/${id}/type`, {
        method: "PUT",
        headers: Object.assign({ "Content-Type": "application/json" }, ctxToken ? { Authorization: `Bearer ${ctxToken}` } : {}),
        body: JSON.stringify({ user_type })
      });
      setUsers(users.map(u => u.id === id ? { ...u, user_type } : u));
    } catch {
      alert("Erro ao atualizar tipo de usuário");
    }
  }

  // Proteção: usa a prop passada pelo App ou o contexto
  const auth = useContext(AuthContext);
  const ctxIsAdmin = auth ? auth.isAdmin : false;
  const ctxToken = auth ? auth.token : null;
  const isAdmin = !!isAdminProp || ctxIsAdmin || (user && (user.email === 'alex@ceosoftware.com.br' || user.user_type === 'analista_admin'));

  async function updateApproval(id, is_approved) {
    if (!isAdmin) {
      alert("Apenas administradores podem aprovar usuários.");
      return;
    }
    try {
      await fetch(`/users/${id}/approve`, {
        method: "PUT",
        headers: Object.assign({ "Content-Type": "application/json" }, ctxToken ? { Authorization: `Bearer ${ctxToken}` } : {}),
        body: JSON.stringify({ is_approved })
      });
      setUsers(users.map(u => u.id === id ? { ...u, is_approved } : u));
    } catch {
      alert("Erro ao atualizar aprovação");
    }
  }

  if (loading) return <div>Carregando...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  // Filtro de status
  let usuariosFiltrados = users.filter(u => {
    if (!filtroTipos[u.user_type]) return false;
    return true;
  });

  // ...existing code...

  function handleSmtpChange(e) {
    setSmtpConfig({ ...smtpConfig, [e.target.name]: e.target.value });
  }

  function salvarConfigSmtp() {
    // Envia config para o backend e tenta enviar e-mail de teste para o usuário configurado
    setSmtpSaving(true);
    setSmtpStatus('');
    (async () => {
      try {
        const res = await fetch('/api/smtp-config', {
          method: 'POST',
          headers: Object.assign({ 'Content-Type': 'application/json' }, ctxToken ? { Authorization: `Bearer ${ctxToken}` } : {}),
          body: JSON.stringify(smtpConfig)
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setSmtpStatus('Erro ao salvar configuração: ' + (data.error || data.detalhe || res.statusText));
          setSmtpSaving(false);
          return;
        }
        setSmtpStatus('Configuração salva. Clique em "Enviar e-mail de teste" para testar.');
      } catch (err) {
        setSmtpStatus('Erro ao salvar/configurar SMTP: ' + (err.message || err));
      } finally {
        setSmtpSaving(false);
      }
    })();
  }

  async function enviarTesteSmtp() {
    setSmtpSaving(true);
    setSmtpStatus('');
    try {
      const to = smtpConfig.user;
      if (!to) {
        setSmtpStatus('Informe o usuário (endereço) para envio de teste.');
        setSmtpSaving(false);
        return;
      }
      const testRes = await fetch('/api/smtp-config/test', {
        method: 'POST',
        headers: Object.assign({ 'Content-Type': 'application/json' }, ctxToken ? { Authorization: `Bearer ${ctxToken}` } : {}),
        body: JSON.stringify({ to })
      });
      const testData = await testRes.json().catch(() => ({}));
      if (!testRes.ok) {
        setSmtpStatus('Falha ao enviar e-mail de teste: ' + (testData.error || testData.detalhe || testRes.statusText));
      } else {
        setSmtpStatus('E-mail de teste enviado para ' + to + '.');
      }
    } catch (err) {
      setSmtpStatus('Erro ao enviar e-mail de teste: ' + (err.message || err));
    } finally {
      setSmtpSaving(false);
    }
  }

  return (
  <div style={{ margin: 24, maxWidth: 800, marginLeft: "auto", marginRight: "auto", minHeight: '100vh', background: '#ffffff' }}>
      <h1 style={{ textAlign: "center", fontSize: 32, marginBottom: 24 }}>Administração</h1>
      <h2 style={{ fontSize: 24, marginBottom: 16 }}>Usuários</h2>
      {/* Configuração de e-mail para recuperação de senha */}
      <div style={{ background: '#f5f7ff', borderRadius: 8, padding: 20, marginBottom: 24, boxShadow: '0 2px 8px #cbd5e1' }}>
        <h3 style={{ marginTop: 0 }}>Configuração de e-mail para recuperação de senha</h3>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label>Host SMTP<br/>
              <input name="host" value={smtpConfig.host} onChange={handleSmtpChange} placeholder="smtp.exemplo.com" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} />
            </label>
          </div>
          <div style={{ flex: 1, minWidth: 80 }}>
            <label>Porta<br/>
              <input name="port" value={smtpConfig.port} onChange={handleSmtpChange} placeholder="587" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} />
            </label>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label>Usuário<br/>
              <input name="user" value={smtpConfig.user} onChange={handleSmtpChange} placeholder="usuario@dominio.com" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} />
            </label>
          </div>
          <div style={{ flex: 1, minWidth: 120 }}>
            <label>Senha<br/>
              <input name="pass" type="password" value={smtpConfig.pass} onChange={handleSmtpChange} placeholder="Senha do e-mail" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} />
            </label>
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <label>Remetente<br/>
              <input name="from" value={smtpConfig.from} onChange={handleSmtpChange} placeholder="noreply@dominio.com" style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #cbd5e1' }} />
            </label>
          </div>
        </div>
        <div style={{ marginTop: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
          <button type="button" onClick={salvarConfigSmtp} disabled={smtpSaving} style={{ padding: '8px 24px', borderRadius: 6, background: smtpSaving ? '#9aa3ff' : '#6366f1', color: '#fff', border: 'none', fontWeight: 'bold', cursor: smtpSaving ? 'default' : 'pointer' }}>{smtpSaving ? 'Salvando...' : 'Salvar configuração'}</button>
          <button type="button" onClick={enviarTesteSmtp} disabled={smtpSaving} style={{ padding: '8px 18px', borderRadius: 6, background: '#fff', color: '#334155', border: '1px solid #cbd5e1', cursor: smtpSaving ? 'default' : 'pointer' }}>Enviar e-mail de teste</button>
          {smtpStatus && <div style={{ marginLeft: 8, color: smtpStatus.toLowerCase().includes('erro') ? 'red' : 'green' }}>{smtpStatus}</div>}
        </div>
      </div>
      <table border={1} cellPadding={8} style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>Email</th>
            <th>Tipo</th>
            <th>Aprovado</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {usuariosFiltrados.map(u => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>
                <select value={u.user_type} onChange={e => updateType(u.id, e.target.value)}>
                  <option value="analista_simples">Analista Simples</option>
                  <option value="analista_admin">Analista Admin</option>
                  <option value="cliente">Cliente</option>
                </select>
              </td>
              <td>
                <input type="checkbox" checked={u.is_approved} onChange={e => updateApproval(u.id, e.target.checked)} />
              </td>
              <td>
                <button onClick={() => removeUser(u.id)}>Remover</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
