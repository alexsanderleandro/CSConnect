import React, { useEffect, useState } from "react";

export default function AdminDepartamentos() {
  const [departamentos, setDepartamentos] = useState([]);
  const [novoNome, setNovoNome] = useState("");
  const [editId, setEditId] = useState(null);
  const [editNome, setEditNome] = useState("");
  const [rascunho, setRascunho] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDepartamentos() {
      try {
        const res = await fetch("/departamentos");
        const data = await res.json();
        setDepartamentos(data.departamentos || []);
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
    try {
      const res = await fetch("/departamentos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nome: novoNome })
      });
      const data = await res.json();
      setDepartamentos([...departamentos, data.departamento]);
      setNovoNome("");
    } catch {
      alert("Erro ao incluir departamento");
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
        headers: { "Content-Type": "application/json" },
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
      await fetch(`/departamentos/${id}/inativar`, { method: "PUT" });
      setDepartamentos(departamentos.map(d => d.id === id ? { ...d, ativo: false } : d));
    } catch {
      alert("Erro ao inativar departamento");
    }
  }

  if (loading) return <div>Carregando...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  return (
    <div style={{ margin: 24 }}>
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
          {departamentos.map(d => (
            <tr key={d.id}>
              <td>{d.id}</td>
              <td>
                {editId === d.id ? (
                  <>
                    <input
                      type="text"
                      maxLength={40}
                      value={rascunho[d.id] ?? d.nome}
                      onChange={e => alterarRascunho(d.id, e.target.value)}
                    />
                    <button onClick={() => salvarEdicao(d.id)}>Salvar</button>
                    <button onClick={() => { setEditId(null); setEditNome(""); setRascunho({ ...rascunho, [d.id]: undefined }); }}>Cancelar</button>
                  </>
                ) : (
                  <>
                    {d.nome}
                    {d.ativo && (
                      <button style={{ marginLeft: 8 }} onClick={() => iniciarEdicao(d.id, d.nome)}>Editar</button>
                    )}
                  </>
                )}
              </td>
              <td>{d.ativo ? "Sim" : "Não"}</td>
              <td>
                {d.ativo && <button onClick={() => inativarDepartamento(d.id)}>Inativar</button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
