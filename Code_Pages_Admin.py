import React, { useState, useEffect } from "react";
import { User } from "@/entities/User";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { ArrowLeft, Users, Shield, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";
import UserManagement from "../components/admin/UserManagement";

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const user = await User.me();
        setCurrentUser(user);
        if (user.role !== 'admin') {
          setLoading(false);
          return;
        }
        await loadUsers();
      } catch (error) {
        console.error("Erro ao carregar dados do admin:", error);
      } finally {
        setLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await User.list();
      setUsers(allUsers);
    } catch (error) {
      toast.error("Falha ao carregar usuários.");
      console.error("Erro ao carregar usuários:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (currentUser?.role !== 'admin') {
    return (
      <div className="flex h-full flex-col items-center justify-center text-center p-6">
        <Shield className="w-16 h-16 text-red-500 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Acesso Negado</h1>
        <p className="text-slate-600 mb-6">Você não tem permissão para acessar esta página.</p>
        <Button asChild>
          <Link to={createPageUrl('Chat')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Chat
          </Link>
        </Button>
      </div>
    );
  }

  const pendingUsers = users.filter(u => u.role === 'pending' || !u.is_active);
  const activeUsers = users.filter(u => u.is_active && u.role !== 'admin' && u.id !== currentUser.id);
  const adminUsers = users.filter(u => u.role === 'admin' && u.id !== currentUser.id);

  return (
    <div className="min-h-full bg-slate-50 p-4 sm:p-6 lg:p-8">
      <Toaster richColors position="top-center" />
      <div className="max-w-5xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center mb-6">
            <Button variant="ghost" size="icon" className="mr-2" asChild>
              <Link to={createPageUrl('Chat')}>
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-slate-900">Painel do Administrador</h1>
          </div>
        </motion.div>

        <div className="space-y-8">
          {pendingUsers.length > 0 && (
            <UserManagement
              title="Usuários Pendentes de Aprovação"
              users={pendingUsers}
              currentUser={currentUser}
              onAction={loadUsers}
              icon={<Clock className="w-6 h-6 text-orange-500" />}
              sectionType="pending"
            />
          )}

          <UserManagement
            title="Usuários Ativos"
            users={activeUsers}
            currentUser={currentUser}
            onAction={loadUsers}
            icon={<Users className="w-6 h-6 text-green-500" />}
            sectionType="active"
          />

          <UserManagement
            title="Administradores"
            users={adminUsers}
            currentUser={currentUser}
            onAction={loadUsers}
            icon={<Shield className="w-6 h-6 text-blue-500" />}
            sectionType="admin"
          />
        </div>
      </div>
    </div>
  );
}