// Força IPv4 primeiro no Node (Windows)
require('dns').setDefaultResultOrder('ipv4first');

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');

const app = express();
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

app.get('/', (req, res) => {
  res.send('API backend está rodando!');
});

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(bodyParser.json());

const SECRET = 'supersecret';
const ADMIN_EMAIL = 'alex@ceosoftware.com.br';

// Configuração do pool PostgreSQL 
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_zkyEgD8taJ3O@ep-green-unit-ac1qfxxk-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000
});

// Função para tentar conectar com retry
async function testConnection(retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      const client = await pool.connect();
      console.log('✅ Conectado!');
      client.release();
      return true;
    } catch (err) {
      console.error(`❌ Falha ao conectar ao Supabase (tentativa ${i + 1}):`, err.code || err.message);
      if (i < retries - 1) {
        console.log(`⏳ Tentando novamente em ${delay / 1000}s...`);
        await new Promise(r => setTimeout(r, delay));
      } else {
        console.error('❌ Não foi possível conectar após várias tentativas.');
        process.exit(1);
      }
    }
  }
}

// Inicializa conexão
testConnection();

// ----------------------- Rotas -----------------------

// Remove usuários fake ao iniciar
pool.query(
  "DELETE FROM users WHERE email IN ('alice@email.com', 'bob@email.com', 'carol@email.com', 'alice@teste.com', 'bob@teste.com', 'carol@teste.com')"
);

// Cria tabela de usuários se não existir
pool.query(`CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  nome VARCHAR(80),
  is_approved BOOLEAN DEFAULT FALSE,
  approval_token VARCHAR(255),
  group_name VARCHAR(50),
  user_type VARCHAR(50),
  company_name VARCHAR(255)
)`);

// Cadastro de novo usuário
app.post('/register', async (req, res) => {
  const { email, password, nome, company_name, user_type } = req.body;
  // isAnalista já é declarado abaixo, então só validar usando ele
  if (!email || !password) return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
  if (!(/@ceosoftware\.com\.br$/i.test(email)) && (!nome || !company_name)) return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });

  const approvalToken = Math.random().toString(36).substring(2, 12);
  const isAnalista = /@ceosoftware\.com\.br$/i.test(email);
  let groupName = isAnalista ? 'ceosoftware' : 'clientes';
  let isApproved = isAnalista ? true : false;
  let finalUserType = isAnalista ? (user_type === 'analista_admin' || user_type === 'analista_simples' ? user_type : 'analista_simples') : 'cliente';

  try {
    await pool.query(
      'INSERT INTO users (email, password, nome, is_approved, approval_token, group_name, user_type, company_name) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)',
      [email, password, nome, isApproved, approvalToken, groupName, finalUserType, isAnalista ? null : company_name]
    );

    if (isAnalista) {
      res.json({ message: 'Cadastro realizado! Você já pode acessar o sistema como analista.' });
    } else {
      // Simulação de envio de e-mail para admin
      console.log(`Novo cliente cadastrado: ${email} | Nome: ${nome} | Empresa: ${company_name}`);
      console.log(`Aprovar em: http://localhost:5000/approve?token=${approvalToken}`);
      // Aqui você pode integrar com serviço de e-mail real
      res.json({ message: 'Cadastro realizado! Seu acesso será liberado após aprovação do administrador. Você receberá um e-mail assim que estiver liberado.' });
    }
  } catch (err) {
    console.error('Erro detalhado ao cadastrar usuário:', err);
    if (err.code === '23505') return res.status(400).json({ error: 'E-mail já cadastrado' });
    return res.status(500).json({ error: 'Erro ao cadastrar usuário', detalhe: err.message });
  }
});

// Aprovação do usuário pelo admin
app.get('/approve', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('Token ausente');
  try {
    const result = await pool.query('UPDATE users SET is_approved = TRUE WHERE approval_token = $1', [token]);
    if (result.rowCount === 0) return res.status(404).send('Token inválido ou usuário já aprovado');
    res.send('Usuário aprovado com sucesso!');
  } catch {
    res.status(500).send('Erro ao aprovar usuário');
  }
});

// Login (só para aprovados)
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });
    if (user.password !== password) return res.status(401).json({ error: 'Senha incorreta' });
    if (!user.is_approved) {
      return res.status(403).json({ error: user.group_name === 'clientes' ? 
        'Seu cadastro de cliente está pendente de aprovação pelo administrador. Aguarde o e-mail de liberação.' : 
        'Usuário ainda não aprovado pelo administrador' 
      });
    }
    const token = jwt.sign({ email: user.email }, SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch {
    res.status(500).json({ error: 'Erro no banco de dados' });
  }
});

// Profile
app.get('/profile', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token ausente' });
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, SECRET);
    res.json({ email: decoded.email });
  } catch {
    res.status(401).json({ error: 'Token inválido' });
  }
});

// Lista de usuários
app.get('/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, email, is_approved, group_name, user_type, company_name FROM users');
    res.json({ users: result.rows });
  } catch {
    res.status(500).json({ error: 'Erro ao buscar usuários' });
  }
});

// Rotina administrativa: remover usuário
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Usuário removido com sucesso.' });
  } catch {
    res.status(500).json({ error: 'Erro ao remover usuário' });
  }
});

// Rotina administrativa: editar tipo de usuário (analista simples, analista admin, cliente)
app.put('/users/:id/type', async (req, res) => {
  const { id } = req.params;
  const { user_type } = req.body;
  if (!['analista_simples', 'analista_admin', 'cliente'].includes(user_type)) {
    return res.status(400).json({ error: 'Tipo de usuário inválido' });
  }
  try {
    await pool.query('UPDATE users SET user_type = $1 WHERE id = $2', [user_type, id]);
    res.json({ message: 'Tipo de usuário atualizado.' });
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar tipo de usuário' });
  }
});

// Rotina administrativa: aprovar/desaprovar usuário
app.put('/users/:id/approve', async (req, res) => {
  const { id } = req.params;
  const { is_approved } = req.body;
  try {
    await pool.query('UPDATE users SET is_approved = $1 WHERE id = $2', [!!is_approved, id]);
    // Busca dados do usuário para enviar e-mail
    const result = await pool.query('SELECT email, nome FROM users WHERE id = $1', [id]);
    if (result.rows.length && !!is_approved) {
      const { email, nome } = result.rows[0];
      // Simulação de envio de e-mail para usuário aprovado
      console.log(`Usuário aprovado: ${email} | Nome: ${nome}`);
      console.log(`(Simulação) E-mail enviado para ${email} informando aprovação.`);
    }
    res.json({ message: 'Status de aprovação atualizado.' });
  } catch {
    res.status(500).json({ error: 'Erro ao atualizar aprovação' });
  }
});

// Rota para usuários online (placeholder)
app.get('/online', (req, res) => {
  res.json({ online: [] });
});

// Inicialização do servidor
app.listen(5000, () => {
  console.log('Backend rodando em http://localhost:5000');
});

// ------------------- DEPARTAMENTOS -------------------
// Cria tabela de departamentos se não existir
pool.query(`CREATE TABLE IF NOT EXISTS departamentos (
  id SERIAL PRIMARY KEY,
  nome VARCHAR(40) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE
)`);

// Listar departamentos
app.get('/departamentos', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nome, ativo FROM departamentos');
    res.json({ departamentos: result.rows });
  } catch {
    res.status(500).json({ error: 'Erro ao buscar departamentos' });
  }
});

// Incluir departamento
app.post('/departamentos', async (req, res) => {
  const { nome } = req.body;
  if (!nome || nome.length > 40) return res.status(400).json({ error: 'Nome obrigatório e até 40 caracteres' });
  try {
    const result = await pool.query('INSERT INTO departamentos (nome) VALUES ($1) RETURNING id, nome, ativo', [nome]);
    res.json({ departamento: result.rows[0] });
  } catch {
    res.status(500).json({ error: 'Erro ao incluir departamento' });
  }
});

// Editar nome do departamento
app.put('/departamentos/:id', async (req, res) => {
  const { id } = req.params;
  const { nome } = req.body;
  if (!nome || nome.length > 40) return res.status(400).json({ error: 'Nome obrigatório e até 40 caracteres' });
  try {
    await pool.query('UPDATE departamentos SET nome = $1 WHERE id = $2', [nome, id]);
    res.json({ message: 'Nome do departamento atualizado.' });
  } catch {
    res.status(500).json({ error: 'Erro ao editar departamento' });
  }
});

// Inativar departamento
app.put('/departamentos/:id/inativar', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE departamentos SET ativo = FALSE WHERE id = $1', [id]);
    res.json({ message: 'Departamento inativado.' });
  } catch {
    res.status(500).json({ error: 'Erro ao inativar departamento' });
  }
});
