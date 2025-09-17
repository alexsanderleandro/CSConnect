# CSConnect

Aplicação de chat com painel administrativo.

## Notas principais

- Endpoints administrativos agora exigem autenticação JWT com `user_type === 'analista_admin'`.
- Verifique se o frontend envia o header `Authorization: Bearer <token>` nas chamadas administrativas.

## Variáveis de ambiente importantes

- `JWT_SECRET` - segredo para assinar tokens JWT (requerido em produção).
- `SMTP_ENC_KEY` - chave de encriptação para senhas SMTP. Em produção, armazene este valor em um gerenciador de segredos (AWS Secrets Manager, Azure Key Vault, GCP Secret Manager, Kubernetes Secret etc.).
- `DATABASE_URL` ou configuração `Pool` - sua URL/postgres connection string.

## Migrações de banco

O repositório removeu DDL inline e recomenda usar migrations formais (node-pg-migrate, Knex ou Flyway). Crie migrations para as tabelas `users` e `smtp_config` e rode-as no deploy antes de iniciar o app.

## Testes de autorização (API)

Adicionei um teste que espera comportamentos 401/403 quando chamadas administrativas são feitas sem token ou por usuário não-admin. Para rodar esse teste, instale `supertest` como devDependency:

```powershell
npm install --save-dev supertest
npm test --silent -- -i --coverage=false --runInBand
```

