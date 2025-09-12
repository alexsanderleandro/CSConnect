import React from "react";
import { motion } from "framer-motion";
import MessageBubble from "./MessageBubble";

export default function MessageList({ messages, currentUser }) {
  if (messages.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-3xl flex items-center justify-center mb-4">
          <span className="text-2xl">💬</span>
        </div>
        <h3 className="text-lg font-semibold text-slate-700 mb-2">Nenhuma mensagem ainda</h3>
        <p className="text-slate-500">Seja o primeiro a iniciar a conversa!</p>
      </div>
    );
  }

  return <div>MessageList (stub)</div>;
}