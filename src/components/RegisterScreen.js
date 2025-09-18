import React, { useState } from 'react';

export default function RegisterScreen({ onRegistered, onSwitchToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [nome, setNome] = useState('');
  const [bloqueioDominio, setBloqueioDominio] = useState(false);
  const [loginTipo, setLoginTipo] = useState('analista'); // 'analista' or 'cliente'

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    let emailFinal = email;
    if (loginTipo === 'analista') {
      emailFinal = email.replace(/@ceosoftware\.com\.br$/, '') + '@ceosoftware.com.br';
    }
    const isAnalista = loginTipo === 'analista';
    if (!emailFinal || !password) {
      setError('Preencha todos os campos obrigatórios!');
      return;
    }
    if (!isAnalista && (!nome || !companyName)) {
      setError('Preencha todos os campos obrigatórios!');
      return;
    }

    try {
      const res = await fetch('/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailFinal, password, nome, company_name: isAnalista ? undefined : companyName })
      });
      const data = await res.json().catch(() => null);
      if (res.ok) {
        const msg = (data && data.message) ? data.message : 'Cadastro realizado.';
        setSuccess(msg.includes('liberado após aprovação') ? 'Cadastro realizado! Seu acesso será liberado após aprovação do administrador. Você receberá um e-mail assim que estiver liberado.' : msg);
        setEmail('');
        setPassword('');
        setNome('');
        setCompanyName('');
        if (onRegistered) onRegistered();
      } else {
        setError((data && data.error) || 'Erro ao cadastrar.');
      }
    } catch (err) {
      setError(err.message || 'Erro ao cadastrar.');
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontSize: 20, marginBottom: 12, color: '#ffffff' }}>Selecione o tipo de cadastro</h2>
      <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
        <button
          type="button"
          style={{ fontSize: 18, padding: '8px 20px', borderRadius: 6, background: loginTipo === 'analista' ? '#6366f1' : '#e0e7ff', color: loginTipo === 'analista' ? '#fff' : '#334155', border: 'none', fontWeight: loginTipo === 'analista' ? 'bold' : 'normal' }}
          onClick={() => setLoginTipo('analista')}
        >Analista</button>
        <button
          type="button"
          style={{ fontSize: 18, padding: '8px 20px', borderRadius: 6, background: loginTipo === 'cliente' ? '#6366f1' : '#e0e7ff', color: loginTipo === 'cliente' ? '#fff' : '#334155', border: 'none', fontWeight: loginTipo === 'cliente' ? 'bold' : 'normal' }}
          onClick={() => setLoginTipo('cliente')}
        >Cliente</button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, minWidth: 320 }}>
        {loginTipo === 'analista' ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="text"
              placeholder="Usuário"
              aria-label="Usuário analista"
              value={email.replace('@ceosoftware.com.br', '')}
              onChange={e => setEmail(e.target.value.replace(/@ceosoftware\.com\.br$/, ''))}
              style={{ fontSize: 18, padding: 12, borderRadius: 6, border: '1px solid #ccc', flex: 1 }}
            />
            <span style={{ fontSize: 18, color: '#334155' }}>@ceosoftware.com.br</span>
          </div>
        ) : (
          <input
            type="email"
            placeholder="E-mail"
            aria-label="E-mail do cliente"
            value={email}
            onChange={e => {
              setEmail(e.target.value);
              if (e.target.value.endsWith('@ceosoftware.com.br')) {
                setBloqueioDominio(true);
                setError('Cliente não pode usar e-mail do domínio ceosoftware.com.br. Use outro domínio.');
              } else {
                setBloqueioDominio(false);
                setError('');
              }
            }}
            onBlur={e => {
              if (e.target.value.endsWith('@ceosoftware.com.br')) {
                setBloqueioDominio(true);
                setError('Cliente não pode usar e-mail do domínio ceosoftware.com.br. Use outro domínio.');
              }
            }}
            style={{ fontSize: 18, padding: 12, borderRadius: 6, border: '1px solid #ccc' }}
          />
        )}

        {loginTipo === 'cliente' && (
          <>
            <input type="text" placeholder="Nome completo" aria-label="Nome completo" value={nome} onChange={e => setNome(e.target.value)} style={{ fontSize: 18, padding: 12, borderRadius: 6, border: '1px solid #ccc' }} />
            <input type="text" placeholder="Nome da empresa" aria-label="Nome da empresa" value={companyName} onChange={e => setCompanyName(e.target.value)} style={{ fontSize: 18, padding: 12, borderRadius: 6, border: '1px solid #ccc' }} />
          </>
        )}

        <input type="password" placeholder="Senha" aria-label="Senha" value={password} onChange={e => setPassword(e.target.value)} style={{ fontSize: 18, padding: 12, borderRadius: 6, border: '1px solid #ccc' }} />

        <div style={{ display: 'flex', gap: 12, marginTop: 12, justifyContent: 'center' }}>
          <button type="submit" style={{ fontSize: 18, padding: 12, borderRadius: 6, minWidth: 120 }} disabled={bloqueioDominio}>Cadastrar</button>
          <button type="button" style={{ fontSize: 18, padding: 12, borderRadius: 6, background: '#eee', minWidth: 120 }} onClick={() => onSwitchToLogin ? onSwitchToLogin() : (onRegistered && onRegistered())}>Entrar</button>
        </div>
      </form>

      {error && <div style={{ color: 'red', marginTop: 8 }}>{error}</div>}
      {success && <div style={{ color: 'green', marginTop: 8 }}>{success}</div>}
      <div style={{ marginTop: 16 }}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>Já tem conta?
          <button onClick={() => onSwitchToLogin ? onSwitchToLogin() : (onRegistered && onRegistered())} style={{ padding: '8px 18px', borderRadius: 9999, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}>Entrar</button>
        </span>
      </div>
    </div>
  );
}
