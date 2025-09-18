import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from '../contexts/AuthContext';

export default function AdminDepartamentos() {
  const auth = useContext(AuthContext);
  const token = auth ? auth.token : null;
  const [departamentos, setDepartamentos] = useState([]);
  const [novoNome, setNovoNome] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNome, setEditNome] = useState("");
  const [rascunho, setRascunho] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [incluirLoading, setIncluirLoading] = useState(false);
  const [sucessoMsg, setSucessoMsg] = useState("");

  useEffect(() => {
    async function fetchDepartamentos() {
      try {
        const res = await fetch("/departamentos");
        const data = await res.json();
        // Normalize possible response shapes: either { departamentos: [...] } or [...]
        const list = Array.isArray(data) ? data : (data && data.departamentos) ? data.departamentos : [];
        setDepartamentos((list || []).filter(Boolean));
      } catch (err) {
        setError("Erro ao buscar departamentos: " + (err.message || err));
      } finally {
        setLoading(false);
      }
    }
    fetchDepartamentos();
  }, []);

  async function incluirDepartamento() {
    if (!novoNome.trim()) return;
    setIncluirLoading(true);
    setError("");
    try {
      const res = await fetch("/departamentos", {
        method: "POST",
        headers: Object.assign({ "Content-Type": "application/json" }, token ? { Authorization: `Bearer ${token}` } : {}),
        body: JSON.stringify({ nome: novoNome })
      });
      const data = await res.json();
      // Accept different possible response shapes: { departamento: {...} } or the department object directly
      const novo = data && (data.departamento || (Array.isArray(data) ? null : data)) || null;
      if (novo) {
        setDepartamentos([...departamentos, novo].filter(Boolean));
        setSucessoMsg('Departamento incluído com sucesso');
        // auto-hide
        setTimeout(() => setSucessoMsg(''), 3000);
      } else {
        // fallback: re-fetch the list to ensure consistent state
        const r = await fetch('/departamentos');
        const d = await r.json();
        const list = Array.isArray(d) ? d : (d && d.departamentos) ? d.departamentos : [];
        setDepartamentos((list || []).filter(Boolean));
        setSucessoMsg('Departamento incluído (lista atualizada)');
        setTimeout(() => setSucessoMsg(''), 3000);
      }
      setNovoNome("");
    } catch (err) {
      console.error('Erro incluirDepartamento', err);
      setError('Erro ao incluir departamento: ' + (err && err.message ? err.message : '')); 
    } finally {
      setIncluirLoading(false);
    }
  }

  function iniciarEdicao(id, nomeAtual) {
    setEditId(id);
    setEditNome(nomeAtual);
    setRascunho({ ...rascunho, [id]: nomeAtual });
  }

  function alterarRascunho(id, novoValor) {
    setRascunho({ ...rascunho, [id]: novoValor });
    setEditNome(novoValor);
  }

  async function salvarEdicao(id) {
    const nomeFinal = rascunho[id];
    if (!nomeFinal || nomeFinal.trim() === "") return;
    try {
      await fetch(`/departamentos/${id}`, {
        method: "PUT",
        headers: Object.assign({ "Content-Type": "application/json" }, token ? { Authorization: `Bearer ${token}` } : {}),
        body: JSON.stringify({ nome: nomeFinal })
      });
      setDepartamentos(departamentos.map(d => d.id === id ? { ...d, nome: nomeFinal } : d));
      setEditId(null);
      setEditNome("");
      setRascunho({ ...rascunho, [id]: undefined });
    } catch {
      alert("Erro ao salvar edição");
    }
  }

  async function inativarDepartamento(id) {
    if (!window.confirm("Inativar este departamento?")) return;
    try {
      await fetch(`/departamentos/${id}/inativar`, { method: "PUT", headers: token ? { Authorization: `Bearer ${token}` } : {} });
      setDepartamentos(departamentos.map(d => d.id === id ? { ...d, ativo: false } : d));
    } catch {
      alert("Erro ao inativar departamento");
    }
  }

  if (loading) return <div>Carregando...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ margin: 24 }}>
      {/* success toast */}
      {sucessoMsg && (
        <div role="status" aria-live="polite" style={{ position: 'fixed', top: 16, right: 16, background: '#16a34a', color: 'white', padding: '8px 12px', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
          {sucessoMsg}
        </div>
      )}
      <h2>Administração de Departamentos</h2>
      <div style={{ marginBottom: 16 }}>
        <input
          type="text"
          maxLength={40}
          value={novoNome}
          onChange={e => setNovoNome(e.target.value)}
          placeholder="Nome do departamento (até 40 caracteres)"
        />
        <button onClick={incluirDepartamento}>Incluir</button>
      </div>
      <table border={1} cellPadding={8}>
        <thead>
          <tr>
            <th>Código</th>
            <th>Nome</th>
            <th>Ativo</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {departamentos.filter(Boolean).map((d, idx) => (
            <tr key={d?.id ?? idx}>
              <td>{d?.id ?? "-"}</td>
              <td>
                {editId === d?.id ? (
                  <>
                    <input
                      type="text"
                      maxLength={40}
                      value={rascunho[d?.id] ?? d?.nome ?? ""}
                      onChange={e => alterarRascunho(d?.id, e.target.value)}
                    />
                    <button onClick={() => salvarEdicao(d?.id)}>Salvar</button>
                    <button onClick={() => { setEditId(null); setEditNome(""); setRascunho({ ...rascunho, [d?.id]: undefined }); }}>Cancelar</button>
                  </>
                ) : (
                  <>
                    {d?.nome ?? "(sem nome)"}
                    {d?.ativo && (
                      <button style={{ marginLeft: 8 }} onClick={() => iniciarEdicao(d?.id, d?.nome)}>Editar</button>
                    )}
                  </>
                )}
              </td>
              <td>{d?.ativo ? "Sim" : "Não"}</td>
              <td>
                {d?.ativo && <button onClick={() => inativarDepartamento(d?.id)}>Inativar</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
