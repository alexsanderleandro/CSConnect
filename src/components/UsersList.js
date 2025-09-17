import React, { useEffect, useState } from "react";

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [online, setOnline] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchUsers() {
      try {
  const res = await fetch("/users");
        const data = await res.json();
        setUsers(data.users || []);
  const resOnline = await fetch("/online");
        const dataOnline = await resOnline.json();
        setOnline(dataOnline.online || []);
      } catch (err) {
        setError("Erro ao buscar usuários: " + (err.message || err));
      } finally {
        setLoading(false);
      }
    }
    fetchUsers();
  }, []);

  if (loading) return <div>Carregando usuários...</div>;
  if (error) return <div style={{ color: "red" }}>{error}</div>;

  // Filtra usuários online do domínio ceosoftware e clientes
  const onlineCeosoftware = online.filter(u => u.email && u.email.endsWith('@ceosoftware.com.br'));
  const onlineClientes = online.filter(u => u.email && !u.email.endsWith('@ceosoftware.com.br'));

  // Não exibe colunas de analistas/clientes logados na tela principal
  return null;
}