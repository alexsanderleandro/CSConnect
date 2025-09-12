
import React, { useState, useEffect, useRef } from "react";
import Message from "./entities/Message";
import Group from "./entities/Group";
// import User from "./entities/User"; // Se existir, ajuste o caminho
import { motion, AnimatePresence } from "framer-motion";
// import { cn } from "./lib/utils"; // Se existir, ajuste o caminho
import { Toaster, toast } from "sonner";

import MessageList from "./components/MessageList";
import MessageInput from "./components/MessageInput";
import ChatHeader from "./components/ChatHeader";
import LoginPrompt from "./components/LoginPrompt";
import UsersList from "./components/UsersList";
import PendingApproval from "./components/PendingApproval";

export default function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState({ type: 'group', id: 'main' });
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  
  const [isMobile, setIsMobile] = useState(false);
  const [mobileView, setMobileView] = useState('list');

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const initializeChat = async () => {
      try {
        let user = await User.me();
        
        // Auto-promote alex@ceosoftware.com.br to admin
        if (user.email === 'alex@ceosoftware.com.br' && (user.role !== 'admin' || !user.is_active)) {
            await User.update(user.id, { role: 'admin', is_active: true });
            user = await User.me(); // Re-fetch user to get updated data
        }

        setCurrentUser(user);
        setIsAuthenticated(true);
        
        // Send approval notification if user is pending
        if (user.role === 'pending' && !user.is_active && !user.approval_notification_sent) {
            const admins = await User.filter({ email: 'alex@ceosoftware.com.br' });
            if (admins.length > 0) {
                const admin = admins[0];
                const conversationId = [admin.id, user.id].sort().join("-");
                
                await Message.create({
                    sender_name: "Sistema",
                    sender_id: "system",
                    recipient_id: admin.id,
                    content: `O usuário ${user.full_name} (${user.email}) está aguardando aprovação. Acesse o Painel de Administrador para analisar.`,
                    conversation_id: conversationId,
                    is_private: true
                });
                
                await User.update(user.id, { approval_notification_sent: true });
            }
        }

      } catch (error) {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
      setLoading(false);
    };
    initializeChat();
  }, []);
  
  // Efeito para atualizar o status "last_seen" do usuário
  useEffect(() => {
    if (!isAuthenticated || !currentUser) return;

    const updatePresence = async () => {
      try {
        await User.updateMyUserData({ last_seen: new Date().toISOString() });
      } catch (error) {
        console.error("Falha ao atualizar presença:", error);
      }
    };

    updatePresence(); // Atualiza uma vez ao carregar
    const presenceInterval = setInterval(updatePresence, 60 * 1000); // Atualiza a cada 60 segundos

    return () => clearInterval(presenceInterval);
  }, [isAuthenticated, currentUser]);

  useEffect(() => {
    if (!isAuthenticated || !currentUser || !currentUser.is_active) return;

    const loadMessages = async () => {
      try {
        let fetchedMessages = [];
        
        if (selectedConversation.type === "group" && selectedConversation.id === 'main') {
          const allMessages = await Message.list("-created_date", 100);
          fetchedMessages = allMessages.filter(msg => !msg.is_private || msg.conversation_id === 'main');
        } else if (selectedConversation.type === 'custom_group' && selectedConversation.id) {
          const allMessages = await Message.list("-created_date", 200);
          fetchedMessages = allMessages.filter(msg => msg.conversation_id === selectedConversation.id);
        } else if (selectedConversation.type === 'private' && selectedConversation.id) {
          const conversationId = [currentUser.id, selectedConversation.id].sort().join("-");
          const allMessages = await Message.list("-created_date", 200);
          fetchedMessages = allMessages.filter(msg => msg.conversation_id === conversationId && msg.is_private === true);
        }
        
        const sortedMessages = fetchedMessages.sort((a, b) => new Date(a.created_date) - new Date(b.created_date));

        setMessages(prevMessages => {
          // --- Lógica de Notificação ---
          if (sortedMessages.length > 0 && prevMessages.length > 0) {
            const latestReceivedId = sortedMessages[sortedMessages.length - 1].id;
            const knownIds = new Set(prevMessages.map(m => m.id));

            if (!knownIds.has(latestReceivedId)) {
              const newMessage = sortedMessages[sortedMessages.length - 1];
              if (newMessage.sender_id !== currentUser.id) {
                let isChatActive = false;
                if (document.hasFocus()) {
                  if (newMessage.is_private && selectedConversation.type === 'private' && newMessage.sender_id === selectedConversation.id) {
                    isChatActive = true;
                  } else if (!newMessage.is_private && (selectedConversation.type === 'group' || selectedConversation.type === 'custom_group') && newMessage.conversation_id === selectedConversation.id) {
                    isChatActive = true;
                  }
                }
                if (!isChatActive) {
                  toast.message(`Nova mensagem de ${newMessage.sender_name}`, {
                    description: newMessage.content || `Enviou um anexo.`,
                  });
                }
              }
            }
          }
          // --- Fim da Lógica de Notificação ---
          return sortedMessages;
        });

      } catch (error) {
        console.error("Erro ao carregar mensagens:", error);
        setMessages([]);
      }
    };

    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [selectedConversation, isAuthenticated, currentUser]);

  const handleLogin = async () => {
    try {
      await User.login();
    } catch (error) {
      console.error("Erro no login:", error);
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSelectedGroup(null);
    setSelectedConversation({ type: 'private', id: user.id });
    if (isMobile) setMobileView('chat');
  };

  const handleSelectGroup = (group) => {
    setSelectedUser(null);
    if (group.id === 'main') {
      setSelectedGroup({ id: 'main', name: 'Chat Principal' });
      setSelectedConversation({ type: 'group', id: 'main' });
    } else {
      setSelectedGroup(group);
      setSelectedConversation({ type: 'custom_group', id: group.id });
    }
    if (isMobile) setMobileView('chat');
  };

  const handleBackToList = () => {
    if (isMobile) {
      setMobileView('list');
      setTimeout(() => {
        setSelectedConversation({ type: 'group', id: 'main' });
        setSelectedUser(null);
        setSelectedGroup(null);
      }, 300);
    }
  };

  const handleSendMessage = async (messageData) => {
    if (!isAuthenticated || !currentUser) return;
    
    try {
      let messageToCreate;

      if (selectedConversation.type === "private" && selectedUser) {
        const conversationId = [currentUser.id, selectedUser.id].sort().join("-");
        messageToCreate = {
          ...messageData,
          sender_name: currentUser.full_name || "Usuário",
          sender_id: currentUser.id,
          recipient_id: selectedUser.id,
          conversation_id: conversationId,
          is_private: true
        };
      } else if (selectedConversation.type === "custom_group" && selectedGroup) {
        messageToCreate = {
          ...messageData,
          sender_name: currentUser.full_name || "Usuário",
          sender_id: currentUser.id,
          recipient_id: null,
          conversation_id: selectedGroup.id,
          is_private: false
        };
      } else {
        messageToCreate = {
          ...messageData,
          sender_name: currentUser.full_name || "Usuário",
          sender_id: currentUser.id,
          recipient_id: null,
          conversation_id: "main",
          is_private: false
        };
      }

      await Message.create(messageToCreate);
    } catch (error) {
      console.error("Erro ao enviar mensagem:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50/30">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPrompt onLogin={handleLogin} />;
  }

  if (currentUser && !currentUser.is_active) {
    return <PendingApproval user={currentUser} />;
  }

  return (
    <div className="h-full flex bg-gradient-to-br from-slate-50 to-blue-50/30 overflow-hidden">
      <Toaster richColors position="top-right" />
      {/* Users Sidebar */}
      <div className={cn(
        "w-full md:w-80 md:flex-shrink-0 border-r border-slate-200/60 bg-white/80 backdrop-blur-xl transition-transform duration-300 ease-in-out",
        isMobile && mobileView === 'chat' ? "-translate-x-full" : "translate-x-0",
        "md:translate-x-0"
      )}>
        <UsersList 
          currentUser={currentUser}
          selectedConversation={selectedConversation}
          onSelectUser={handleSelectUser}
          onSelectGroup={handleSelectGroup}
        />
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col absolute md:static top-0 left-0 w-full h-full transition-transform duration-300 ease-in-out",
         isMobile && mobileView === 'list' ? "translate-x-full" : "translate-x-0",
         "md:translate-x-0"
      )}>
        <ChatHeader 
          currentUser={currentUser} 
          selectedUser={selectedUser}
          selectedGroup={selectedGroup}
          conversationType={selectedConversation.type}
          onBack={handleBackToList}
        />
        
        <div className="flex-1 overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="max-w-4xl mx-auto">
              <AnimatePresence>
                <MessageList messages={messages} currentUser={currentUser} />
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>
          </div>
          
          <div className="border-t border-slate-200/60 bg-white/80 backdrop-blur-xl">
            <div className="max-w-4xl mx-auto px-4 py-4">
              <MessageInput onSendMessage={handleSendMessage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
