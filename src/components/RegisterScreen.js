import React, { useState } from "react";

export default function RegisterScreen({ onRegistered }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [nome, setNome] = useState("");
  const [bloqueioDominio, setBloqueioDominio] = useState(false);
  const [loginTipo, setLoginTipo] = useState("analista"); // analista ou cliente

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    let emailFinal = email;
    if (loginTipo === "analista") {
      emailFinal = email.replace(/@ceosoftware\.com\.br$/, "") + "@ceosoftware.com.br";
    }
    const isAnalista = loginTipo === "analista";
    if (!emailFinal || !password) {
      setError("Preencha todos os campos obrigatórios!");
      return;
    }
    if (!isAnalista && (!nome || !companyName)) {
      setError("Preencha todos os campos obrigatórios!");
      return;
    }
    try {
      const res = await fetch("/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailFinal, password, nome, company_name: isAnalista ? undefined : companyName })
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(data.message);
        setEmail("");
        setPassword("");
        if (data.message && data.message.includes('liberado após aprovação')) {
          setSuccess('Cadastro realizado! Seu acesso será liberado após aprovação do administrador. Você receberá um e-mail assim que estiver liberado.');
        }
        if (onRegistered) onRegistered();
      } else {
        setError(data.error || "Erro ao cadastrar");
      }
    } catch (err) {
      setError("Erro de conexão com o servidor: " + (err.message || err));
    }
  }

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      background: "linear-gradient(135deg, #f8fafc 0%, #e0e7ff 50%, #ffe4e6 100%)"
    }}>
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
        marginBottom: 16,
        letterSpacing: 1,
        textShadow: '1px 1px 4px #cbd5e1'
      }}>by CEOsoftware</div>
  <h2 style={{ fontSize: 32, marginBottom: 16, color: '#334155' }}>Cadastro</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <button
          type="button"
          style={{ fontSize: 18, padding: '8px 20px', borderRadius: 6, background: loginTipo === "analista" ? "#6366f1" : "#e0e7ff", color: loginTipo === "analista" ? "#fff" : "#334155", border: "none", fontWeight: loginTipo === "analista" ? "bold" : "normal" }}
          onClick={() => setLoginTipo("analista")}
  >Analista</button>
        <button
          type="button"
          style={{ fontSize: 18, padding: '8px 20px', borderRadius: 6, background: loginTipo === "cliente" ? "#6366f1" : "#e0e7ff", color: loginTipo === "cliente" ? "#fff" : "#334155", border: "none", fontWeight: loginTipo === "cliente" ? "bold" : "normal" }}
          onClick={() => setLoginTipo("cliente")}
  >Cliente</button>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 320 }}>
        {loginTipo === "analista" ? (
          <>
            <label style={{ fontSize: 20, marginBottom: 4 }}>E-mail</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input
                type="text"
                placeholder="Seu usuário"
                value={email.replace("@ceosoftware.com.br", "")}
                onChange={e => setEmail(e.target.value.replace(/@ceosoftware\.com\.br$/, ""))}
                style={{ fontSize: 18, padding: 12, borderRadius: 6, border: '1px solid #ccc', flex: 1 }}
              />
              <span style={{ fontSize: 18, color: '#334155' }}>@ceosoftware.com.br</span>
            </div>
          </>
        ) : (
          <>
            <label style={{ fontSize: 20, marginBottom: 4 }}>E-mail</label>
            <input
              type="email"
              placeholder="E-mail"
              value={email}
              onChange={e => {
                setEmail(e.target.value);
                if (e.target.value.endsWith("@ceosoftware.com.br")) {
                  setBloqueioDominio(true);
                  setError("Cliente não pode usar e-mail do domínio ceosoftware.com.br. Use outro domínio.");
                } else {
                  setBloqueioDominio(false);
                  setError("");
                }
              }}
              onBlur={e => {
                if (e.target.value.endsWith("@ceosoftware.com.br")) {
                  setBloqueioDominio(true);
                  setError("Cliente não pode usar e-mail do domínio ceosoftware.com.br. Use outro domínio.");
                }
              }}
              style={{ fontSize: 18, padding: 12, borderRadius: 6, border: '1px solid #ccc' }}
            />
          </>
        )}
        {loginTipo === "cliente" && (
          <>
            <label style={{ fontSize: 20, marginBottom: 4 }}>Nome</label>
            <input type="text" placeholder="Nome completo" value={nome} onChange={e => setNome(e.target.value)} style={{ fontSize: 18, padding: 12, borderRadius: 6, border: '1px solid #ccc' }} />
            <label style={{ fontSize: 20, marginBottom: 4 }}>Nome da empresa</label>
            <input type="text" placeholder="Nome da empresa" value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ fontSize: 18, padding: 12, borderRadius: 6, border: '1px solid #ccc' }} />
          </>
        )}
        <label style={{ fontSize: 20, marginBottom: 4 }}>Senha</label>
        <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} style={{ fontSize: 18, padding: 12, borderRadius: 6, border: '1px solid #ccc' }} />
        <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'center' }}>
          <button type="submit" style={{ fontSize: 18, padding: 12, borderRadius: 6, minWidth: 120 }} disabled={bloqueioDominio}>Cadastrar</button>
          <button type="button" style={{ fontSize: 18, padding: 12, borderRadius: 6, background: '#eee', minWidth: 120 }} onClick={onRegistered}>Cancelar</button>
        </div>
      </form>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: "green", marginTop: 8 }}>{success}</div>}
      <div style={{ marginTop: 16 }}>
        <span>Já tem conta? <button onClick={onRegistered}>Entrar</button></span>
      </div>
    </div>
  );
}
