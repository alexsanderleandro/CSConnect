import React, { useState, useEffect } from 'react';

export default function LoginScreen({ onLogin, onRegister }) {
  const [titleOffset, setTitleOffset] = useState(0);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loginType, setLoginType] = useState('analista');
  const [adminMode, setAdminMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mm = window.matchMedia('(min-width: 768px)');
    const update = () => setTitleOffset(mm.matches ? -36 : -12);
    update();
    if (mm.addEventListener) mm.addEventListener('change', update); else mm.addListener(update);
    return () => { if (mm.removeEventListener) mm.removeEventListener('change', update); else mm.removeListener(update); };
  }, []);

  async function handleForgotSubmit() {
    setForgotMsg('');
    if (!forgotEmail) {
      setForgotMsg('E-mail obrigatório.');
      return;
    }
    try {
      const res = await fetch('/api/recuperar-senha', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data && data.message) setForgotMsg('Se o e-mail estiver cadastrado e autorizado, você receberá instruções para redefinir sua senha.');
      else if (res.status === 404) setForgotMsg('E-mail não encontrado ou não autorizado.');
      else if (data && data.error) setForgotMsg(data.error);
      else setForgotMsg('Erro ao processar solicitação. Tente novamente.');
    } catch (err) {
      setForgotMsg('Erro ao processar solicitação. Tente novamente.');
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    let emailToValidate = email;
    if (loginType === 'analista' || adminMode) emailToValidate = `${email}@ceosoftware.com.br`;
    if (!email || !password) {
      setError('Preencha todos os campos!');
      return;
    }
    if ((loginType === 'analista' || adminMode) && !emailToValidate.endsWith('@ceosoftware.com.br')) {
      setError('E-mail deve ser do domínio ceosoftware.com.br');
      return;
    }
    if (adminMode && emailToValidate !== 'admin@ceosoftware.com.br') {
      setError('Somente o administrador pode acessar por este modo.');
      return;
    }

    try {
      const res = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailToValidate, password })
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        if (res.status === 401) setError('Usuário ou senha inválidos.');
        else if (res.status === 403) setError((data && data.error) || 'Usuário não autorizado ou pendente de aprovação.');
        else setError((data && data.error) || 'Erro ao fazer login.');
        return;
      }
      const token = data && data.token ? data.token : null;
      await onLogin(emailToValidate, password, adminMode ? 'admin' : loginType, token);
    } catch (err) {
      setError(err.message || 'Erro ao fazer login.');
    }
  }

  return (
    <div style={{
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      height: '100vh',
      backgroundImage: "linear-gradient(180deg, rgba(15,23,42,0.88), rgba(79,70,229,0.72)), url('/assets/background.jpg')",
      backgroundBlendMode: 'overlay',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      padding: 20
    }}>
      {/* botão de administração permanece no DOM para que possamos posicionar o modal em relação a ele */}
      <button
        onClick={() => setAdminMode(true)}
        style={{
          position: 'absolute', top: 32, right: 32,
          background: adminMode ? '#c7d2fe' : '#e0e7ff',
          border: 'none', borderRadius: 8, padding: 10,
          boxShadow: adminMode ? '0 4px 12px rgba(99,102,241,0.18)' : '0 2px 8px #cbd5e1',
          cursor: 'pointer', zIndex: 101,
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
        title="Área administrativa"
        aria-expanded={adminMode}
      >
        <span role="img" aria-label="admin" style={{ fontSize: 22 }}>⚙️</span>
      </button>

      <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: 440, background: 'rgba(255,255,255,0.92)', padding: 28, borderRadius: 16, boxShadow: '0 8px 24px rgba(16,24,40,0.08)', backdropFilter: 'blur(6px)' }}>
          <div style={{ transform: `translateY(${titleOffset}px)`, transition: 'transform 220ms ease', textAlign: 'center', marginBottom: 6 }}>
            <h1 style={{ fontFamily: 'Segoe UI, Arial, sans-serif', fontWeight: 900, fontSize: 36, color: '#0f172a', margin: 0, letterSpacing: 1 }}>
              <span style={{ marginRight: 8 }}>🔗</span>CSConnect
            </h1>
            <div style={{ fontFamily: 'Segoe UI, Arial, sans-serif', fontWeight: 500, fontSize: 14, color: '#9aa4b2', marginTop: 6 }}>by CEOsoftware</div>
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => {
                setLoginType('analista');
                setEmail('');
                setPassword('');
                setError('');
              }}
              style={{ padding: '8px 18px', borderRadius: 9999, border: 'none', cursor: 'pointer', fontWeight: loginType === 'analista' ? '700' : '500', background: loginType === 'analista' ? 'linear-gradient(90deg,#4f46e5,#6366f1)' : '#f1f5f9', color: loginType === 'analista' ? '#fff' : '#475569', boxShadow: loginType === 'analista' ? '0 6px 18px rgba(79,70,229,0.16)' : 'none' }}
            >Analista</button>
            <button
              type="button"
              onClick={() => {
                setLoginType('cliente');
                setEmail('');
                setPassword('');
                setError('');
              }}
              style={{ padding: '8px 18px', borderRadius: 9999, border: 'none', cursor: 'pointer', fontWeight: loginType === 'cliente' ? '700' : '500', background: loginType === 'cliente' ? 'linear-gradient(90deg,#4f46e5,#6366f1)' : '#f1f5f9', color: loginType === 'cliente' ? '#fff' : '#475569', boxShadow: loginType === 'cliente' ? '0 6px 18px rgba(79,70,229,0.16)' : 'none' }}
            >Cliente</button>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 280 }}>
            {showForgot && (
              <div style={{ position: 'fixed', inset: 0, background: 'rgba(51,65,85,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10 }}>
                <div style={{ background: '#fff', padding: 32, borderRadius: 12, boxShadow: '0 2px 16px #cbd5e1', minWidth: 320, display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 22, color: '#334155' }}>Recuperar senha</h3>
                  <label htmlFor="forgotEmail" style={{ fontWeight: 'bold', fontSize: 16 }}>Informe seu e-mail cadastrado:</label>
                  <input id="forgotEmail" type="email" value={forgotEmail} onChange={e => setForgotEmail(e.target.value)} placeholder="Seu e-mail" style={{ padding: '10px 12px', fontSize: 18, borderRadius: 6, border: '1px solid #cbd5e1' }} />
                  <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                    <button type="button" style={{ padding: '8px 20px', borderRadius: 6, background: '#e0e7ff', color: '#334155', border: 'none' }} onClick={() => setShowForgot(false)}>Cancelar</button>
                    <button type="button" style={{ padding: '8px 20px', borderRadius: 6, background: '#6366f1', color: '#fff', border: 'none', fontWeight: 'bold' }} onClick={handleForgotSubmit}>Recuperar</button>
                  </div>
                  {forgotMsg && <div style={{ color: forgotMsg.startsWith('E-mail') ? 'red' : 'green', marginTop: 8 }}>{forgotMsg}</div>}
                </div>
              </div>
            )}

            {(loginType === 'analista' || adminMode) ? (
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8, gap: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flex: 1, background: '#fff', borderRadius: 8, padding: '8px 10px', border: '1px solid #e6eef8' }}>
                  <span style={{ fontSize: 16, color: '#9aa4b2' }}>👤</span>
                  <input id="email" type="text" value={email} onChange={e => setEmail(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, ''))} placeholder="Usuário" aria-label="Usuário analista" style={{ flex: 1, padding: 8, fontSize: 16, border: 'none', outline: 'none' }} />
                  <span style={{ fontSize: 14, color: '#94a3b8' }}>@ceosoftware.com.br</span>
                </div>
              </div>
            ) : (
              <div style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 8, padding: '8px 10px', border: '1px solid #e6eef8' }}>
                  <span style={{ fontSize: 16, color: '#9aa4b2' }}>👤</span>
                  <input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Usuário" aria-label="E-mail do cliente" style={{ flex: 1, padding: 8, fontSize: 16, border: 'none', outline: 'none' }} />
                </div>
              </div>
            )}

            <div style={{ marginBottom: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fff', borderRadius: 8, padding: '8px 10px', border: '1px solid #e6eef8' }}>
                <span style={{ fontSize: 16, color: '#9aa4b2' }}>🔒</span>
                <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} aria-label="Senha" style={{ flex: 1, padding: 8, fontSize: 16, border: 'none', outline: 'none' }} />
              </div>
              <div style={{ textAlign: 'right', marginTop: 8 }}>
                <button type="button" onClick={() => setShowForgot(true)} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 14 }}>Esqueci a senha</button>
              </div>
            </div>

            <button type="submit" style={{ fontSize: 16, padding: '12px 16px', borderRadius: 12, marginTop: 8, width: '100%', border: 'none', cursor: 'pointer', background: 'linear-gradient(90deg,#0f172a,#4f46e5)', color: '#fff', fontWeight: '700', boxShadow: '0 10px 30px rgba(79,70,229,0.12)' }} onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.06)'} onMouseOut={e => e.currentTarget.style.filter = 'none'}>Entrar</button>

            <div style={{ textAlign: 'center', marginTop: 8 }}>
              <span style={{ color: '#475569', marginRight: 8 }}>Não tem conta?</span>
              <button
                onClick={() => {
                  setEmail('');
                  setPassword('');
                  setError('');
                  if (onRegister) onRegister();
                }}
                style={{ padding: '8px 18px', borderRadius: 9999, background: '#6366f1', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: '600' }}
              >Cadastre-se</button>
            </div>

            {error && (
              <div style={{ color: 'red', marginTop: 8, textAlign: 'center', width: '100%' }}>
                {error}
              </div>
            )}
          </form>

          {adminMode && <AdminLoginModalWrapper onLogin={onLogin} isOpen={adminMode} onClose={() => setAdminMode(false)} />}
        </div>
      </div>
    </div>
  );
}

export function AdminLoginModalWrapper({ onLogin, isOpen, onClose }) {
  const [isMobile, setIsMobile] = useState(false);
  const [modalPos, setModalPos] = useState(null);
  const [animating, setAnimating] = useState(false);
  const modalRef = React.useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setIsMobile(false);
      return;
    }
    const mm = window.matchMedia('(max-width: 767px)');
    const upd = () => setIsMobile(mm.matches);
    upd();
    if (mm.addEventListener) mm.addEventListener('change', upd); else mm.addListener(upd);
    return () => { if (mm.removeEventListener) mm.removeEventListener('change', upd); else mm.removeListener(upd); };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    if (typeof window === 'undefined') return;
    // prevent body from scrolling / growing while modal is open
    const prevBodyOverflow = document.body && document.body.style ? document.body.style.overflow : '';
    try { if (document.body && document.body.style) document.body.style.overflow = 'hidden'; } catch (e) { /* ignore */ }
    // function to compute and set modal position
    const compute = () => {
      const btn = document.querySelector('button[title="Área administrativa"]');
      if (!btn) {
        setModalPos(null);
        return;
      }
      const rect = btn.getBoundingClientRect();
      // calculate a robust left/top so modal appears near the gear button and never goes off-screen
      const modalMaxW = 420; // same as modal maxWidth
      const preferGap = 8;
      const modalW = Math.min(modalMaxW, Math.round(Math.min(window.innerWidth - preferGap * 2, modalMaxW)));

      // compute top first
      const preferTop = Math.round(rect.bottom + preferGap);
      const estModalH = Math.min(Math.round(window.innerHeight * 0.8), 600); // estimate height
      let topPx = preferTop;
      if (topPx + estModalH + preferGap > window.innerHeight) {
        // not enough space below, try above
        const altTop = Math.round(rect.top - estModalH - preferGap);
        topPx = Math.max(preferGap, altTop);
      }

      // Try to locate the login card and compute a weighted center (favor the card)
      let cardEl = document.querySelector('div[style*="max-width: 440px"]');
      if (!cardEl) {
        const maybeH1 = document.querySelector('h1');
        if (maybeH1 && maybeH1.closest) cardEl = maybeH1.closest('div');
      }
      const btnCenterX = rect.left + rect.width / 2;
      const btnCenterY = rect.top + rect.height / 2;
      let weightedTargetX = btnCenterX;
      let weightedTargetY = btnCenterY;
      if (cardEl) {
        try {
          const cardRect = cardEl.getBoundingClientRect();
          const cardCenterX = cardRect.left + cardRect.width / 2;
          const cardCenterY = cardRect.top + cardRect.height / 2;
          // use card center as reference (center modal over the login info)
          weightedTargetX = Math.round(cardCenterX);
          weightedTargetY = Math.round(cardCenterY);

          // use estimated modal size to create an initial position, but store target for measurement pass
          const estLeft = Math.round(weightedTargetX - modalW / 2);
          const estTop = Math.round(weightedTargetY - estModalH / 2);
          const clampedLeft = Math.max(preferGap, Math.min(estLeft, Math.round(window.innerWidth - modalW - preferGap)));
          const clampedTop = Math.max(preferGap, Math.min(estTop, Math.round(window.innerHeight - estModalH - preferGap)));
          // store targetX/targetY so measurement step can recalc using real modal dims
          setModalPos({ left: clampedLeft, top: clampedTop, useRight: false, targetX: weightedTargetX, targetY: weightedTargetY });
          return;
        } catch (e) {
          // ignore and fallback to button center
        }
      }

      // Decide whether to anchor by right (better when button is near the right edge)
      const spaceRight = Math.round(window.innerWidth - rect.right);
      const ADJ_X = 8; // small nudge right by default
      const ADJ_Y = -6; // small nudge up by default
      if (spaceRight < modalW + preferGap * 2) {
        // anchor by right: compute distance from viewport right edge to button right edge
        let rightPx = Math.max(preferGap, Math.round(window.innerWidth - rect.right + preferGap));
        // move slightly to the right (smaller rightPx) and a bit up
        rightPx = Math.max(preferGap, rightPx - ADJ_X);
        const topAdj = Math.max(preferGap, topPx + ADJ_Y);
  // compute modal left when right-anchored
  const modalLeft = Math.round(window.innerWidth - rightPx - modalW);
  const originXr = Math.round(((btnCenterX - modalLeft) / modalW) * 100);
  const originYr = Math.round(((btnCenterY - topAdj) / estModalH) * 100);
        const transformOriginR = `${Math.max(10, Math.min(90, originXr))}% ${Math.max(10, Math.min(90, originYr))}%`;
        setModalPos({ right: rightPx, top: topAdj, useRight: true, transformOrigin: transformOriginR });
        setTimeout(() => setAnimating(true), 10);
        return;
      }

      // otherwise compute left anchor so modal sits near the button
      let leftPx = Math.round(rect.right - modalW + preferGap);
      if (leftPx < preferGap) {
        const leftOfButton = Math.round(rect.left - modalW - preferGap);
        if (leftOfButton >= preferGap) leftPx = leftOfButton;
        else leftPx = Math.max(preferGap, Math.min(Math.round(rect.left), Math.round(window.innerWidth - modalW - preferGap)));
      }
  // Clamp to viewport and apply small nudge so the modal centers better over the card
  leftPx = Math.max(preferGap, Math.min(leftPx + ADJ_X, Math.round(window.innerWidth - modalW - preferGap)));
  const topAdj = Math.max(preferGap, topPx + ADJ_Y);
  // compute transformOrigin for left-anchored modal (use weighted target)
  const modalLeft2 = Math.round(leftPx);
  const originX2 = Math.round(((weightedTargetX - modalLeft2) / modalW) * 100);
  const originY2 = Math.round(((weightedTargetY - topAdj) / estModalH) * 100);
  const transformOrigin2 = `${Math.max(10, Math.min(90, originX2))}% ${Math.max(10, Math.min(90, originY2))}%`;
  setModalPos({ left: leftPx, top: topAdj, useRight: false, transformOrigin: transformOrigin2 });
  setTimeout(() => setAnimating(true), 10);
    };

    // initial compute
    setAnimating(false);
    // measure real modal size after it's mounted (use a frame to ensure DOM updated)
    const measureAndCompute = () => {
      // compute positioning first
      compute();
      // capture current button rect for use in measurement pass (avoid using `rect` from compute scope)
      const btn = document.querySelector('button[title="Área administrativa"]');
      const measuredRect = btn ? btn.getBoundingClientRect() : null;
      // then, if modal element exists, measure and correct the top using real height
      requestAnimationFrame(() => {
        try {
          const el = modalRef.current;
          if (el) {
            const realH = el.offsetHeight;
            const realW = el.offsetWidth;
            // if modalPos exists and contains a stored targetX/targetY, recalc left/top exactly
            setModalPos(prev => {
              if (!prev) return prev;
              const preferGap = 8;
              if (prev.targetX || prev.targetY) {
                const tX = prev.targetX || (measuredRect ? (measuredRect.left + measuredRect.width / 2) : (window.innerWidth / 2));
                const tY = prev.targetY || (measuredRect ? (measuredRect.top + measuredRect.height / 2) : (window.innerHeight / 2));
                let newLeft = Math.round(tX - realW / 2);
                let newTop = Math.round(tY - realH / 2);
                newLeft = Math.max(preferGap, Math.min(newLeft, Math.round(window.innerWidth - realW - preferGap)));
                newTop = Math.max(preferGap, Math.min(newTop, Math.round(window.innerHeight - realH - preferGap)));
                // compute transformOrigin so animation looks like it's coming from the button
                const btnCenterX = measuredRect ? (measuredRect.left + measuredRect.width / 2) : (tX);
                const btnCenterY = measuredRect ? (measuredRect.top + measuredRect.height / 2) : (tY);
                const originX = Math.round(((btnCenterX - newLeft) / realW) * 100);
                const originY = Math.round(((btnCenterY - newTop) / realH) * 100);
                const transformOrigin = `${Math.max(10, Math.min(90, originX))}% ${Math.max(10, Math.min(90, originY))}%`;
                const copy = { ...prev, left: newLeft, top: newTop, transformOrigin };
                // clean target markers
                delete copy.targetX; delete copy.targetY;
                return copy;
              }
              // fallback: clamp previous top using realH
              const prevTop = prev.top || 72;
              const clampedTop = Math.max(preferGap, Math.min(prevTop, Math.round(window.innerHeight - realH - preferGap)));
              return { ...prev, top: clampedTop };
            });
          }
        } catch (e) { /* ignore measurement issues */ }
        // trigger animation after measurement
        setTimeout(() => setAnimating(true), 12);
      });
    };
    measureAndCompute();
    // recompute on resize and scroll to keep modal anchored
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, { passive: true });
    // also observe layout changes on the button's ancestor (MutationObserver fallback)
    let mo;
    try {
      mo = new MutationObserver(compute);
      const btn = document.querySelector('button[title="Área administrativa"]');
      if (btn && btn.parentElement) mo.observe(btn.parentElement, { attributes: true, childList: true, subtree: true });
    } catch (e) {
      // ignore if MutationObserver not supported
    }

    return () => {
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute);
      if (mo) mo.disconnect();
      try { if (document.body && document.body.style) document.body.style.overflow = prevBodyOverflow; } catch (e) { /* ignore */ }
      setAnimating(false);
    };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(51,65,85,0.12)', zIndex: 9999, overflow: 'hidden' }}>
      {isMobile ? (
        // centered modal for small screens
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div
            style={{
              position: 'relative',
              background: '#fff',
              boxShadow: '0 6px 20px rgba(16,24,40,0.12)',
              borderRadius: 12,
              minWidth: 280,
              maxWidth: 420,
              width: '100%',
              padding: '20px',
              zIndex: 10000,
              transformOrigin: modalPos && modalPos.transformOrigin ? modalPos.transformOrigin : 'center center',
              transform: animating ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.88)',
              opacity: animating ? 1 : 0,
              transition: 'transform 260ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease'
            }}
          >
            <AdminLoginModal onLogin={onLogin} onClose={onClose} />
          </div>
        </div>
      ) : (
        // desktop: position modal using computed left/top to anchor near the gear button
        <div
          ref={modalRef}
          style={{
            position: 'fixed',
            top: modalPos ? modalPos.top : 72,
            left: modalPos ? modalPos.left : undefined,
            right: modalPos ? undefined : 32,
            background: '#fff',
            boxShadow: '0 6px 20px rgba(16,24,40,0.12)',
            borderRadius: 12,
            minWidth: 320,
            maxWidth: 420,
            width: 'auto',
            padding: '20px',
            zIndex: 10000,
            overflow: 'hidden',
            transformOrigin: modalPos && modalPos.transformOrigin ? modalPos.transformOrigin : 'center center',
            transform: animating ? 'translateY(0) scale(1)' : 'translateY(-8px) scale(0.88)',
            opacity: animating ? 1 : 0,
            transition: 'transform 260ms cubic-bezier(.2,.9,.2,1), opacity 220ms ease'
          }}
        >
          <AdminLoginModal onLogin={onLogin} onClose={onClose} />
        </div>
      )}
    </div>
  );
}

export function AdminLoginModal({ onLogin, onClose }) {
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [error, setError] = useState('');
  const [logs, setLogs] = useState([]);
  const [showLogs, setShowLogs] = useState(false);

  async function handleAdminLogin(e) {
    e.preventDefault();
    setError('');
    const emailToValidate = `${adminName.trim().toLowerCase()}@ceosoftware.com.br`;
    if (!adminName || !adminPassword) {
      setError('Preencha todos os campos!');
      return;
    }
    if (!emailToValidate.endsWith('@ceosoftware.com.br')) {
      setError('Somente usuários do domínio ceosoftware.com.br podem acessar.');
      return;
    }

    try {
      const pushLog = (msg) => { setLogs(prev => [...prev.slice(-9), `${new Date().toLocaleTimeString()} - ${msg}`]); console.log('[AdminLoginModal]', msg); };
      pushLog(`Enviando /api/check-type-user -> ${emailToValidate}`);
      const res = await fetch('/api/check-type-user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: emailToValidate }) });
      pushLog(`Status da resposta: ${res.status} ${res.statusText || ''}`);
      let data = null;
      try { data = await res.json(); } catch (err) { pushLog(`Falha ao parsear JSON da resposta: ${err.message}`); }
      pushLog(`Corpo da resposta: ${data ? JSON.stringify(data) : 'null'}`);

      if (!res.ok) { const serverMsg = data && (data.error || data.detalhe) ? (data.error || data.detalhe) : `(${res.status} ${res.statusText || ''})`; setError(serverMsg || 'Erro ao verificar tipo de usuário.'); return; }
      if (!data || !data.user_type) { setError('Resposta inesperada do servidor ao verificar tipo de usuário.'); return; }
      if (data.user_type !== 'analista_admin') { setError('Somente usuários analista_admin podem acessar por este modo.'); return; }

      pushLog(`Enviando /login para ${emailToValidate}`);
      const resLogin = await fetch('/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: emailToValidate, password: adminPassword }) });
      const dataLogin = await resLogin.json().catch(() => null);
      pushLog(`Login status: ${resLogin.status} ${resLogin.statusText || ''}`);
      if (!resLogin.ok) {
        if (resLogin.status === 401) setError('Usuário ou senha inválidos.');
        else if (resLogin.status === 403) setError(dataLogin && dataLogin.error ? dataLogin.error : 'Usuário não autorizado ou pendente de aprovação.');
        else setError(dataLogin && dataLogin.error ? dataLogin.error : 'Erro ao fazer login.');
        return;
      }
      const tokenLogin = dataLogin && dataLogin.token ? dataLogin.token : null;
      await onLogin(emailToValidate, adminPassword, 'admin', tokenLogin);
    } catch (err) {
      setError('Erro ao verificar tipo de usuário.');
    }
  }

  return (
    <div style={{ padding: 32, borderRadius: 12, background: '#fff', boxShadow: '0 2px 16px #cbd5e1', minWidth: 320 }}>
      <h2 style={{ fontSize: 28, marginBottom: 16, color: '#334155', textAlign: 'center' }}>Login Administrador</h2>
      <form onSubmit={handleAdminLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label htmlFor="adminName" style={{ fontWeight: 'bold', fontSize: 16 }}>Usuário</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', maxWidth: 340 }}>
            <input id="adminName" type="text" value={adminName} onChange={e => setAdminName(e.target.value.replace(/[^a-zA-Z0-9_.-]/g, ''))} placeholder="Usuário" style={{ flex: 1, minWidth: 0, padding: '10px 12px', fontSize: 18, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f5f7ff', marginRight: 4 }} />
            <span style={{ fontSize: 15, color: '#64748b', background: '#f5f7ff', padding: '7px 8px', borderRadius: 6, border: '1px solid #cbd5e1', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>@ceosoftware.com.br</span>
          </div>
        </div>
        <label htmlFor="adminPassword" style={{ fontWeight: 'bold', fontSize: 16 }}>Senha</label>
        <input id="adminPassword" type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} placeholder="Senha" style={{ width: '100%', padding: '10px 12px', fontSize: 18, borderRadius: 6, border: '1px solid #cbd5e1', background: '#f5f7ff', marginBottom: 16 }} />
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <button type="submit" style={{ fontSize: 18, padding: '8px 24px', borderRadius: 6, background: '#fff', border: '1px solid #334155', color: '#334155', fontWeight: 'bold', cursor: 'pointer' }}>Entrar</button>
          <button type="button" style={{ fontSize: 18, padding: '8px 24px', borderRadius: 6, background: '#fff', border: '1px solid #334155', color: '#334155', cursor: 'pointer' }} onClick={() => { setAdminName(''); setAdminPassword(''); setError(''); if (onClose) onClose(); }}>Cancelar</button>
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
