import React, { useState, useEffect } from "react";

export default function LoginScreen({ onLogin, onRegister }) {
  const [titleOffset, setTitleOffset] = useState(0);

  useEffect(() => {
    // executa somente em ambiente browser
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mm = window.matchMedia('(min-width: 768px)');
    const update = () => setTitleOffset(mm.matches ? -36 : -12);
    update();
    mm.addEventListener ? mm.addEventListener('change', update) : mm.addListener(update);
    return () => { mm.removeEventListener ? mm.removeEventListener('change', update) : mm.removeListener(update); };
  }, []);
  async function handleForgotSubmit() {
    setForgotMsg("");
    if (!forgotEmail) {
      setForgotMsg("E-mail obrigatório.");
      return;
    }
    // Chamada para backend: verificar se e-mail existe e está autorizado
    try {
      const res = await fetch("/api/recuperar-senha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json();
      if (res.ok && data.message) {
        setForgotMsg("Se o e-mail estiver cadastrado e autorizado, você receberá instruções para redefinir sua senha.");
      } else if (res.status === 404) {
        setForgotMsg("E-mail não encontrado ou não autorizado.");
      } else if (data.error) {
        setForgotMsg(data.error);
      } else {
        setForgotMsg("Erro ao processar solicitação. Tente novamente.");
      }
    } catch (err) {
      setForgotMsg("Erro ao processar solicitação. Tente novamente.");
    }
  }
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginType, setLoginType] = useState("analista");
  const [adminMode, setAdminMode] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    let emailToValidate = email;
    if (loginType === "analista" || adminMode) {
      emailToValidate = `${email}@ceosoftware.com.br`;
    }
    if (!email || !password) {
      setError("Preencha todos os campos!");
      return;
    }
    if ((loginType === "analista" || adminMode) && !emailToValidate.endsWith("@ceosoftware.com.br")) {
      setError("E-mail deve ser do domínio ceosoftware.com.br");
      return;
    }
    if (adminMode && emailToValidate !== "admin@ceosoftware.com.br") {
      setError("Somente o administrador pode acessar por este modo.");
      return;
    }
    setError("");
    try {
      const res = await fetch("/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToValidate, password })
      });
      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setError("Usuário ou senha inválidos.");
        } else if (res.status === 403) {
          setError(data.error || "Usuário não autorizado ou pendente de aprovação.");
        } else {
          setError(data.error || "Erro ao fazer login.");
        }
        return;
      }
      // forward token to context via onLogin
      const token = data && data.token ? data.token : null;
      await onLogin(emailToValidate, password, adminMode ? "admin" : loginType, token);
    } catch (err) {
      setError(err.message || "Erro ao fazer login.");
    }
  }

  return (
    <div style={{
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
  backgroundImage: 'url(/assets/background.jpg)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Botão de engrenagem para login admin (único) */}
      {!adminMode && (
        <button
          onClick={() => setAdminMode(true)}
          style={{
            position: "absolute",
            top: 32,
            right: 32,
            background: "#e0e7ff",
            border: "none",
            borderRadius: 8,
            padding: 10,
            boxShadow: "0 2px 8px #cbd5e1",
            cursor: "pointer",
            zIndex: 101,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
          title="Área administrativa"
        >
          <span role="img" aria-label="admin" style={{ fontSize: 28 }}>⚙️</span>
        </button>
      )}
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ transform: `translateY(${titleOffset}px)`, transition: 'transform 220ms ease' }}>
        <h1 style={{
          fontFamily: 'Segoe UI, Arial, sans-serif',
          fontWeight: 900,
          fontSize: 48,
          color: '#1e293b',
          marginBottom: 0,
          letterSpacing: 2,
          textShadow: '2px 2px 8px #cbd5e1, 0 2px 0 #64748b, 0 4px 12px #334155'
        }}>CSConnect</h1>
        <div style={{
          fontFamily: 'Segoe UI, Arial, sans-serif',
          fontWeight: 500,
          fontSize: 18,
          color: 'rgba(51, 65, 85, 0.8)',
          marginBottom: 8,
          letterSpacing: 1,
          textShadow: '1px 1px 4px #cbd5e1',
          textAlign: 'center',
          width: '100%',
          maxWidth: 420
        }}>by CEOsoftware</div>
        </div>
        <h2 style={{ fontSize: adminMode ? 32 : 22, marginBottom: 8, color: '#ffffff' }}>{adminMode ? "Login Administrador" : "Selecione o tipo de login"}</h2>
      </div>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <button
          type="button"
          style={{
            fontSize: 18,
            padding: "8px 20px",
            borderRadius: 6,
            background: loginType === "analista" ? "#000000" : "#e0e7ff",
            color: loginType === "analista" ? "#fff" : "#334155",
            border: "none",
            fontWeight: loginType === "analista" ? "bold" : "normal",
            boxShadow: loginType === "analista" ? "0 2px 8px #cbd5e1" : "none"
          }}
          onClick={() => { setLoginType("analista"); }}
        >Analista</button>
        <button
          type="button"
          style={{
            fontSize: 18,
            padding: "8px 20px",
            borderRadius: 6,
            background: loginType === "cliente" ? "#6366f1" : "#e0e7ff",
            color: loginType === "cliente" ? "#fff" : "#334155",
            border: "none",
            fontWeight: loginType === "cliente" ? "bold" : "normal",
            boxShadow: loginType === "cliente" ? "0 2px 8px #cbd5e1" : "none"
          }}
          onClick={() => { setLoginType("cliente"); }}
        >Cliente</button>
      </div>
  <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 320 }}>
      {showForgot && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(51,65,85,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
          <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px #cbd5e1', minWidth: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ margin: 0, fontSize: 22, color: '#334155' }}>Recuperar senha</h3>
            <label htmlFor="forgotEmail" style={{ fontWeight: 'bold', fontSize: 16 }}>Informe seu e-mail cadastrado:</label>
            <input id="forgotEmail" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="seu e-mail" style={{ padding: '10px 12px', fontSize: 18, borderRadius: 6, border: '1px solid #cbd5e1' }} />
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <button type="button" style={{ padding: '8px 20px', borderRadius: 6, background: '#e0e7ff', color: '#334155', border: 'none' }} onClick={() => setShowForgot(false)}>Cancelar</button>
              <button type="button" style={{ padding: '8px 20px', borderRadius: 6, background: '#6366f1', color: '#fff', border: 'none', fontWeight: 'bold' }} onClick={handleForgotSubmit}>Recuperar</button>
            </div>
            {forgotMsg && <div style={{ color: forgotMsg.startsWith('E-mail') ? 'red' : 'green', marginTop: 8 }}>{forgotMsg}</div>}
          </div>
        </div>
      )}
          {/* labels visuais removidos para layout mais limpo; inputs preservam acessibilidade via aria-label */}
          {(loginType === "analista" || adminMode) ? (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
              <input
                id="email"
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, ""))}
                placeholder="usuário"
                aria-label="Usuário analista"
                style={{
                  flex: 1,
                  padding: "10px 12px",
                  fontSize: 18,
                  borderRadius: 6,
                  border: "1px solid #cbd5e1",
                  marginRight: 6
                }}
              />
              <span style={{ fontSize: 18, color: "#64748b" }}>@ceosoftware.com.br</span>
            </div>
          ) : (
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="seu e-mail"
              aria-label="E-mail do cliente"
              style={{
                width: "100%",
                padding: "10px 12px",
                fontSize: 18,
                borderRadius: 6,
                border: "1px solid #cbd5e1",
                marginBottom: 16
              }}
            />
          )}
        {/* label de senha visual removida; aria-label adicionado nos inputs de senha */}
        {loginType === "analista" ? (
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            aria-label="Senha"
            style={{ width: "calc(60% + 190px)", maxWidth: 390, padding: "10px 12px", fontSize: 18, borderRadius: 6, border: "1px solid #cbd5e1", marginBottom: 16 }}
          />
        ) : (
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            aria-label="Senha"
            style={{ width: "100%", padding: "10px 12px", fontSize: 18, borderRadius: 6, border: "1px solid #cbd5e1", marginBottom: 16 }}
          />
        )}
  <button
    type="submit"
    style={{
      fontSize: 20,
      padding: 12,
      borderRadius: 8,
      marginTop: 12,
      alignSelf: 'center',
      minWidth: 160,
      border: 'none',
      cursor: 'pointer',
  background: loginType === 'analista' ? '#111827' : '#6366f1',
  color: '#ffffff',
  boxShadow: loginType === 'analista' ? '0 6px 0 rgba(0,0,0,0.15), 0 10px 20px rgba(2,6,23,0.25)' : '0 6px 0 rgba(99,102,241,0.22), 0 12px 28px rgba(99,102,241,0.18)'
    }}
  >Entrar</button>
  <button type="button" style={{ fontSize: 16, marginTop: 8, alignSelf: 'center', background: 'none', border: 'none', color: '#6366f1', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => setShowForgot(true)}>Esqueci a senha</button>
      </form>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      <div style={{ marginTop: 16 }}>
        <span>Não tem conta? <button onClick={onRegister}>Cadastre-se</button></span>
      </div>
      {/* Modal de login admin - aparece apenas se adminMode estiver ativo */}
      {adminMode && (
        <AdminLoginModalWrapper onLogin={onLogin} isOpen={adminMode} onClose={() => setAdminMode(false)} />
      )}
    </div>
  );
}

// Integração do modal de login de administrador
export function AdminLoginModalWrapper({ onLogin, isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(51,65,85,0.15)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
  <div style={{ position: 'relative', background: '#fff', boxShadow: '0 2px 16px #cbd5e1', borderRadius: 16, minWidth: 320, maxWidth: 400, width: '100%', padding: '32px 24px 24px 24px' }}>
        <AdminLoginModal onLogin={onLogin} onClose={onClose} />
        <button onClick={onClose} style={{ position: 'absolute', top: 12, right: 12, fontSize: 24, background: 'none', border: 'none', color: '#334155', cursor: 'pointer' }}>×</button>
      </div>
    </div>
  );
}

// Corrige exportação do modal de login de administrador
export function AdminLoginModal({ onLogin, onClose }) {
  const [adminName, setAdminName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [error, setError] = useState("");
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  // onClose já é recebido corretamente como prop do wrapper

  async function handleAdminLogin(e) {
    e.preventDefault();
    setError("");
  const emailToValidate = `${adminName.trim().toLowerCase()}@ceosoftware.com.br`;
    if (!adminName || !adminPassword) {
      setError("Preencha todos os campos!");
      return;
    }
    if (!emailToValidate.endsWith("@ceosoftware.com.br")) {
      setError("Somente usuários do domínio ceosoftware.com.br podem acessar.");
      return;
    }
    // sem fallback temporário; usar fluxo padrão de verificação via backend

    // Verifica se o usuário é analista_admin no backend
    try {
      const pushLog = (msg) => {
        setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()} - ${msg}`]);
        console.log('[AdminLoginModal]', msg);
      };
      pushLog(`Enviando /api/check-type-user -> ${emailToValidate}`);
      const res = await fetch("/api/check-type-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailToValidate })
      });
      pushLog(`Status da resposta: ${res.status} ${res.statusText || ''}`);
      let data = null;
      try {
        data = await res.json();
      } catch (err) {
        pushLog(`Falha ao parsear JSON da resposta: ${err.message}`);
      }
      pushLog(`Corpo da resposta: ${data ? JSON.stringify(data) : 'null'}`);

      if (!res.ok) {
        // resposta de erro do servidor
        const serverMsg = data && (data.error || data.detalhe) ? (data.error || data.detalhe) : `(${res.status} ${res.statusText || ''})`;
        setError(serverMsg || "Erro ao verificar tipo de usuário.");
        return;
      }

      // res.ok === true
      if (!data || !data.user_type) {
        setError("Resposta inesperada do servidor ao verificar tipo de usuário.");
        return;
      }

      if (data.user_type !== "analista_admin") {
        setError("Somente usuários analista_admin podem acessar por este modo.");
        return;
      }

      // usuário é analista_admin -> prosseguir para login
      try {
        pushLog(`Enviando /login para ${emailToValidate}`);
        const resLogin = await fetch("/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: emailToValidate, password: adminPassword })
        });
        const dataLogin = await resLogin.json().catch(() => null);
        pushLog(`Login status: ${resLogin.status} ${resLogin.statusText || ''}`);
        if (!resLogin.ok) {
          if (resLogin.status === 401) {
            setError("Usuário ou senha inválidos.");
          } else if (resLogin.status === 403) {
            setError(dataLogin && dataLogin.error ? dataLogin.error : "Usuário não autorizado ou pendente de aprovação.");
          } else {
            setError(dataLogin && dataLogin.error ? dataLogin.error : "Erro ao fazer login.");
          }
          return;
        }
        const tokenLogin = dataLogin && dataLogin.token ? dataLogin.token : null;
        await onLogin(emailToValidate, adminPassword, "admin", tokenLogin);
      } catch (err) {
        setError(err.message || "Erro ao fazer login.");
        return;
      }
    } catch (err) {
      setError("Erro ao verificar tipo de usuário.");
      return;
    }
  }

  return (
    <div style={{ padding: 32, borderRadius: 12, background: '#fff', boxShadow: '0 2px 16px #cbd5e1', minWidth: 320 }}>
      <h2 style={{ fontSize: 28, marginBottom: 16, color: '#334155', textAlign: 'center' }}>Login Administrador</h2>
      <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label htmlFor="adminName" style={{ fontWeight: 'bold', fontSize: 16 }}>Usuário</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', maxWidth: 340 }}>
            <input
              id="adminName"
              type="text"
              value={adminName}
              onChange={e => setAdminName(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, ""))}
              placeholder="Usuário"
              style={{ flex: 1, minWidth: 0, padding: '10px 12px', fontSize: 18, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f5f7ff', marginRight: 4 }}
            />
            <span style={{ fontSize: 15, color: '#64748b', background: '#f5f7ff', padding: '7px 8px', borderRadius: 6, border: '1px solid #cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>@ceosoftware.com.br</span>
          </div>
        </div>
        <label htmlFor="adminPassword" style={{ fontWeight: 'bold', fontSize: 16 }}>Senha</label>
        <input
          id="adminPassword"
          type="password"
          value={adminPassword}
          onChange={e => setAdminPassword(e.target.value)}
              placeholder="Senha"
          style={{ width: '100%', padding: '10px 12px', fontSize: 18, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f5f7ff', marginBottom: 16 }}
        />
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button type="submit" style={{ fontSize: 18, padding: '8px 24px', borderRadius: 6, background: '#fff', border: '1px solid #334155', color: '#334155', fontWeight: 'bold', cursor: 'pointer' }}>Entrar</button>
          <button type="button" style={{ fontSize: 18, padding: '8px 24px', borderRadius: 6, background: '#fff', border: '1px solid #334155', color: '#334155', cursor: 'pointer' }} onClick={() => { setAdminName(""); setAdminPassword(""); setError(""); if (onClose) onClose(); }}>Cancelar</button>
        </div>
      </form>
      {error && <div style={{ color: 'red', marginTop: 8, textAlign: 'center' }}>{error}</div>}
      <div style={{ marginTop: 12, textAlign: 'center' }}>
        <button onClick={() => setShowLogs(s => !s)} style={{ background: 'none', border: 'none', color: '#64748b', textDecoration: 'underline', cursor: 'pointer' }}>{showLogs ? 'Ocultar logs' : 'Mostrar logs'}</button>
      </div>
      {showLogs && (
        <div style={{ marginTop: 8, maxHeight: 180, overflowY: 'auto', background: '#0f172a', color: '#e6eef8', padding: 8, borderRadius: 8, fontSize: 12, fontFamily: 'monospace' }}>
          {logs.length === 0 ? <div>Nenhum log ainda.</div> : logs.map((l, i) => <div key={i}>{l}</div>)}
        </div>
      )}
    </div>
  );
}
