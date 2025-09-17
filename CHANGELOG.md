# Changelog

## [Unreleased]

- Security: rotas administrativas agora exigem autenticação JWT e `user_type === 'analista_admin'`.
  - Protegidas: `DELETE /users/:id`, `PUT /users/:id/type`, `PUT /users/:id/approve`, `GET|POST /api/smtp-config`, `POST /api/smtp-config/test`.
  - O frontend foi atualizado para enviar `Authorization: Bearer <token>` quando disponível.

- SMTP: configuração persistida em banco com senha criptografada; adicionado endpoint de teste (`/api/smtp-config/test`).

- Auth: token JWT retornado em `/login` agora é salvo no `AuthContext` do frontend e usado em chamadas administrativas.

- Misc: melhorias de UX na tela de administração (botão "Salvar" com estado, botão separado "Enviar e-mail de teste", mensagens de status).
