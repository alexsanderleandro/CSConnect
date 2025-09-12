import React, { useEffect, useState } from "react";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filtroAprovacao, setFiltroAprovacao] = useState("todos"); // todos, aprovados, pendentes
  const [filtroTipos, setFiltroTipos] = useState({
    analista_simples: true,
    analista_admin: true,
    cliente: true
  });

  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch("/users");
        const data = await res.json();
        setUsers(data.users || []);
      } catch (err) {
        setError("Erro ao buscar usuários: " + (err.message || err));
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  async function removeUser(id) {
    if (!window.confirm("Remover este usuário?")) return;
    try {
      await fetch(`/users/${id}`, { method: "DELETE" });
      setUsers(users.filter(u => u.id !== id));
    } catch {
      alert("Erro ao remover usuário");
    }
  }

  async function updateType(id, user_type) {
    try {
      await fetch(`/users/${id}/type`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_type })
      });
      setUsers(users.map(u => u.id === id ? { ...u, user_type } : u));
    } catch {
      alert("Erro ao atualizar tipo de usuário");
    }
  }

  // Simulação de proteção: só permite se o usuário logado for admin
  const isAdmin = (window.localStorage.getItem("user_type") === "analista_admin" || window.localStorage.getItem("email") === "alex@ceosoftware.com.br");

  async function updateApproval(id, is_approved) {
    if (!isAdmin) {
      alert("Apenas administradores podem aprovar usuários.");
      return;
    }
    try {
      await fetch(`/users/${id}/approve`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
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
    if (filtroAprovacao === "aprovados" && !u.is_approved) return false;
    if (filtroAprovacao === "pendentes" && u.is_approved) return false;
    if (!filtroTipos[u.user_type]) return false;
    return true;
  });

  return (
    <div style={{ margin: 24, maxWidth: 800, marginLeft: "auto", marginRight: "auto" }}>
      <h1 style={{ textAlign: "center", fontSize: 32, marginBottom: 24 }}>Administração</h1>
      <h2 style={{ fontSize: 24, marginBottom: 16 }}>Usuários</h2>
      {/* Filtros */}
      <div style={{ display: "flex", gap: 32, marginBottom: 16, alignItems: "center" }}>
        <div>
          <label>Status:&nbsp;</label>
          <select value={filtroAprovacao} onChange={e => setFiltroAprovacao(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="aprovados">Aprovados</option>
            <option value="pendentes">Aguardando aprovação</option>
          </select>
        </div>
        <div>
          <label>Tipo:&nbsp;</label>
          <label><input type="checkbox" checked={filtroTipos.analista_simples} onChange={e => setFiltroTipos(t => ({ ...t, analista_simples: e.target.checked }))} /> Analista Simples</label>&nbsp;
          <label><input type="checkbox" checked={filtroTipos.analista_admin} onChange={e => setFiltroTipos(t => ({ ...t, analista_admin: e.target.checked }))} /> Analista Admin</label>&nbsp;
          <label><input type="checkbox" checked={filtroTipos.cliente} onChange={e => setFiltroTipos(t => ({ ...t, cliente: e.target.checked }))} /> Cliente</label>
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
