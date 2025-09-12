import React, { useState } from "react";

export default function LoginScreen({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loginType, setLoginType] = useState("analista");

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    let emailToValidate = email;
    if (loginType === "analista") {
      emailToValidate = `${email}@ceosoftware.com.br`;
    }
    if (!email || !password) {
      setError("Preencha todos os campos!");
      return;
    }
    if (loginType === "analista" && !emailToValidate.endsWith("@ceosoftware.com.br")) {
      setError("E-mail de analista deve ser do domínio ceosoftware.com.br");
      return;
    }
    setError("");
    try {
      await onLogin(loginType === "analista" ? emailToValidate : email, password, loginType);
    } catch (err) {
      setError(err.message || "Erro ao fazer login.");
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
      <h2 style={{ fontSize: 32, marginBottom: 16, color: '#334155' }}>Login</h2>
      <div style={{ display: "flex", gap: 16, marginBottom: 16 }}>
        <button
          type="button"
          style={{
            fontSize: 18,
            padding: "8px 20px",
            borderRadius: 6,
            background: loginType === "analista" ? "#6366f1" : "#e0e7ff",
            color: loginType === "analista" ? "#fff" : "#334155",
            border: "none",
            fontWeight: loginType === "analista" ? "bold" : "normal",
            boxShadow: loginType === "analista" ? "0 2px 8px #cbd5e1" : "none"
          }}
          onClick={() => setLoginType("analista")}
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
          onClick={() => setLoginType("cliente")}
        >Cliente</button>
      </div>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, minWidth: 320 }}>
          <label htmlFor="email" style={{ fontWeight: "bold", fontSize: 18, marginBottom: 4 }}>
            {loginType === "analista" ? "Usuário" : "E-mail"}
          </label>
          {loginType === "analista" ? (
            <div style={{ display: "flex", alignItems: "center", marginBottom: 16 }}>
              <input
                id="email"
                type="text"
                value={email}
                onChange={e => setEmail(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, ""))}
                placeholder="Usuário"
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
              placeholder="E-mail"
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
        <label style={{ fontSize: 20, marginBottom: 4 }}>Senha</label>
        {loginType === "analista" ? (
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: "calc(60% + 190px)", maxWidth: 390, padding: "10px 12px", fontSize: 18, borderRadius: 6, border: "1px solid #cbd5e1", marginBottom: 16 }}
          />
        ) : (
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={e => setPassword(e.target.value)}
            style={{ width: "100%", padding: "10px 12px", fontSize: 18, borderRadius: 6, border: "1px solid #cbd5e1", marginBottom: 16 }}
          />
        )}
  <button type="submit" style={{ fontSize: 20, padding: 12, borderRadius: 6, marginTop: 12, alignSelf: 'center', minWidth: 160 }}>Entrar</button>
      </form>
      {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
      <div style={{ marginTop: 16 }}>
        <span>Não tem conta? <button onClick={onRegister}>Cadastre-se</button></span>
      </div>
    </div>
  );
}
