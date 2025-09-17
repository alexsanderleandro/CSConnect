require('dns').setDefaultResultOrder('ipv4first');
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const crypto = require('crypto');
// Configuração do pool PostgreSQL Neon.tech
// Chave secreta para JWT
const SECRET = process.env.JWT_SECRET || 'csconnect_secret_key';
const pool = new Pool({
  connectionString: 'postgresql://neondb_owner:npg_zkyEgD8taJ3O@ep-green-unit-ac1qfxxk-pooler.sa-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
  ssl: { rejectUnauthorized: false },
  connectionTimeoutMillis: 5000
});

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

// Rotas de recuperação/redefinição de senha
app.get('/definir-senha', async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).send('Token ausente');
  res.send(`
    <html><body style="font-family:Arial;max-width:400px;margin:40px auto;">
      <h2>Definir nova senha</h2>
      <form method="POST" action="/definir-senha">
        <input type="hidden" name="token" value="${token}" />
        <label>Nova senha:</label><br />
        <input type="password" name="novaSenha" style="width:100%;padding:8px;margin:8px 0;" required /><br />
        <button type="submit" style="padding:8px 20px;">Salvar</button>
      </form>
    </body></html>
  `);
});

app.post('/definir-senha', express.urlencoded({ extended: true }), async (req, res) => {
  const { token, novaSenha } = req.body;
  if (!token || !novaSenha) return res.status(400).send('Token ou senha ausente');
  try {
    const result = await pool.query('UPDATE users SET password = $1 WHERE approval_token = $2 RETURNING email', [novaSenha, token]);
    if (result.rowCount === 0) return res.status(400).send('Token inválido ou expirado');
    res.send('<h3>Senha redefinida com sucesso! Você já pode acessar o sistema.</h3>');
  } catch (err) {
    res.status(500).send('Erro ao salvar nova senha');
  }
});

app.post('/api/recuperar-senha', async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'E-mail obrigatório.' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1 AND is_approved = TRUE', [email]);
    const user = result.rows[0];
    if (!user) return res.status(404).json({ error: 'E-mail não encontrado ou não autorizado.' });
    const token = crypto.randomBytes(32).toString('hex');
    await pool.query('UPDATE users SET approval_token = $1 WHERE email = $2', [token, email]);
    // Envio de e-mail real via Nodemailer (Gmail SMTP gratuito)
    const nodemailer = require('nodemailer');
    // Configuração padrão para Gmail (pode ser ajustada para outro serviço gratuito)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER || 'seuemail@gmail.com',
        pass: process.env.SMTP_PASS || 'suasenha'
      }
    });
    const mailOptions = {
      from: process.env.SMTP_FROM || 'CSConnect <seuemail@gmail.com>',
      to: email,
      subject: 'Recuperação de senha - CSConnect',
      html: `<p>Olá,</p><p>Recebemos uma solicitação para redefinir sua senha.</p><p><a href="http://localhost:5000/definir-senha?token=${token}">Clique aqui para redefinir sua senha</a></p><p>Se não foi você, ignore este e-mail.</p>`
    };
    await transporter.sendMail(mailOptions);
    res.json({ message: 'E-mail enviado com instruções para redefinir a senha.' });
  } catch (err) {
    console.error('Erro ao recuperar senha:', err);
    res.status(500).json({ error: 'Erro ao processar recuperação de senha.', detalhe: err.message });
  }
});

// --- Logging com winston (fallback para console) ---
let logger = console;
try {
  const winston = require('winston');
  const DailyRotateFile = require('winston-daily-rotate-file');
  logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ level, message, timestamp }) => `${timestamp} [${level}] ${message}`)
    ),
    transports: [
      new winston.transports.Console(),
      new DailyRotateFile({ filename: 'logs/application-%DATE%.log', datePattern: 'YYYY-MM-DD', maxFiles: '14d' })
    ]
  });
} catch (err) {
  console.warn('winston não disponível, usando console para logs. Instale winston e winston-daily-rotate-file para logs avançados.');
}

// Helper de criptografia simétrica para senha SMTP
const cryptoKeyRaw = process.env.SMTP_ENC_KEY || SECRET;
const cryptoKey = crypto.createHash('sha256').update(String(cryptoKeyRaw)).digest(); // 32 bytes
function encryptText(plain) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', cryptoKey, iv);
  const encrypted = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}
function decryptText(enc) {
  if (!enc) return '';
  try {
    const parts = enc.split(':');
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', cryptoKey, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString('utf8');
  } catch (err) {
    logger.warn('Falha ao decriptar texto:', err.message || err);
    return '';
  }
}

// Cria tabela smtp_config se não existir
pool.query(`CREATE TABLE IF NOT EXISTS smtp_config (
  id SERIAL PRIMARY KEY,
  host VARCHAR(255),
  port VARCHAR(10),
  user_email VARCHAR(255),
  pass_encrypted TEXT,
  from_email VARCHAR(255),
  updated_at TIMESTAMP DEFAULT NOW()
)`);

// Middleware para exigir admin via JWT
async function requireAdmin(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: 'Token ausente' });
  try {
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, SECRET);
    // buscar usuário
    const result = await pool.query('SELECT user_type, email FROM users WHERE email = $1', [decoded.email]);
    const user = result.rows[0];
    if (!user) return res.status(401).json({ error: 'Usuário inválido' });
    if (user.user_type !== 'analista_admin') return res.status(403).json({ error: 'Apenas administradores podem acessar' });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Token inválido' });
  }
}

// GET config (apenas admin)
app.get('/api/smtp-config', requireAdmin, async (req, res) => {
  try {
    const r = await pool.query('SELECT host, port, user_email, from_email, pass_encrypted FROM smtp_config ORDER BY id DESC LIMIT 1');
    if (!r.rows.length) return res.json({ config: null });
    const row = r.rows[0];
    // não retornar a senha em texto; apenas sinalizar que senha está configurada
    res.json({ config: { host: row.host, port: row.port, user: row.user_email, from_email: row.from_email, hasPass: !!row.pass_encrypted } });
  } catch (err) {
    logger.error('Erro ao buscar config SMTP: ' + (err.message || err));
    res.status(500).json({ error: 'Erro ao buscar config SMTP', detalhe: err.message });
  }
});

// POST save config (apenas admin)
app.post('/api/smtp-config', requireAdmin, async (req, res) => {
  const { host, port, user, pass, from } = req.body;
  if (!host || !port || !user || !from) {
    return res.status(400).json({ error: 'Campos obrigatórios: host, port, user, from. (Senha opcional para manter configuração atual)' });
  }
  try {
    const passEncrypted = pass ? encryptText(pass) : null;
    // Inserir nova linha
    await pool.query('INSERT INTO smtp_config (host, port, user_email, pass_encrypted, from_email, updated_at) VALUES ($1,$2,$3,$4,$5,NOW())', [host, String(port), user, passEncrypted, from]);
    res.json({ message: 'Configuração SMTP salva.' });
  } catch (err) {
    logger.error('Erro ao salvar config SMTP: ' + (err.message || err));
    res.status(500).json({ error: 'Erro ao salvar config SMTP', detalhe: err.message });
  }
});

// POST enviar e-mail de teste (apenas admin)
app.post('/api/smtp-config/test', requireAdmin, async (req, res) => {
  const { to } = req.body;
  if (!to) return res.status(400).json({ error: 'Informe o destinatário (to) para o e-mail de teste.' });
  try {
    const r = await pool.query('SELECT host, port, user_email, pass_encrypted, from_email FROM smtp_config ORDER BY id DESC LIMIT 1');
    if (!r.rows.length) return res.status(400).json({ error: 'Configuração SMTP não encontrada. Salve a configuração antes de testar.' });
    const cfg = r.rows[0];
    const pass = cfg.pass_encrypted ? decryptText(cfg.pass_encrypted) : '';
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: cfg.host,
      port: Number(cfg.port) || 587,
      secure: Number(cfg.port) === 465,
      auth: { user: cfg.user_email, pass }
    });
    const info = await transporter.sendMail({
      from: cfg.from_email || cfg.user_email,
      to,
      subject: 'Teste de configuração SMTP - CSConnect',
      text: `Este é um e-mail de teste enviado pela configuração SMTP. Se você recebeu, a configuração está correta.`,
    });
    logger.info('E-mail de teste enviado: ' + (info && info.messageId ? info.messageId : JSON.stringify(info)));
    res.json({ message: 'E-mail de teste enviado.' });
  } catch (err) {
    logger.error('Erro ao enviar e-mail de teste: ' + (err.message || err));
    res.status(500).json({ error: 'Erro ao enviar e-mail de teste.', detalhe: err.message });
  }
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

// Inicializa conexão apenas quando executado diretamente (não ao importar para testes)
if (require.main === module) {
  testConnection();
}

// ----------------------- Rotas -----------------------
// Endpoint para verificar tipo de usuário
app.post('/api/check-type-user', async (req, res) => {
  const { email } = req.body;
  console.log('[check-type-user] Email recebido:', email);
  if (!email) return res.status(400).json({ error: 'E-mail obrigatório.' });
  try {
    const result = await pool.query('SELECT user_type FROM users WHERE email = $1', [email]);
    console.log('[check-type-user] Resultado da query:', result.rows);
    if (!result.rows.length) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json({ user_type: result.rows[0].user_type });
  } catch (err) {
    console.error('[check-type-user] Erro:', err);
    res.status(500).json({ error: 'Erro ao buscar tipo de usuário.', detalhe: err.message });
  }
});

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
  if (!email || !password) return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
  // Validação de e-mail para cliente
  if (!(/@ceosoftware\.com\.br$/i.test(email))) {
    if (!nome || !company_name) return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
    // Email de cliente deve ser corporativo válido
    if (!/^([a-zA-Z0-9_.+-]+)@([a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)$/.test(email)) {
      return res.status(400).json({ error: 'E-mail do cliente inválido' });
    }
  }
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
    // Remove definitivamente usuários fake
    await pool.query("DELETE FROM users WHERE email IN ('alice@email.com', 'bob@email.com', 'carol@email.com', 'alice@teste.com', 'bob@teste.com', 'carol@teste.com')");
    // Filtro de status: ?status=todos|aprovados|pendentes
    const status = req.query.status || 'aprovados';
    let query = 'SELECT id, email, is_approved, group_name, user_type, company_name FROM users';
    if (status === 'aprovados') {
      query += ' WHERE is_approved = TRUE';
    } else if (status === 'pendentes') {
      query += ' WHERE is_approved = FALSE';
    }
    const result = await pool.query(query);
    res.json({ users: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao buscar usuários', detalhe: err.message });
  }
});

// Rotina administrativa: remover usuário
app.delete('/users/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
    res.json({ message: 'Usuário removido com sucesso.' });
  } catch {
    res.status(500).json({ error: 'Erro ao remover usuário' });
  }
});

// Rotina administrativa: editar tipo de usuário (analista simples, analista admin, cliente)
app.put('/users/:id/type', requireAdmin, async (req, res) => {
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
app.put('/users/:id/approve', requireAdmin, async (req, res) => {
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
      // Aqui você pode integrar com serviço real de e-mail
      console.log(`E-mail enviado para ${email} informando aprovação.\nAssunto: Seu acesso foi liberado\nMensagem: Olá ${nome || email}, seu cadastro foi aprovado! Você já pode acessar o sistema.`);
    }
    res.json({ message: 'Status de aprovação atualizado.' });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao atualizar aprovação', detalhe: err.message });
  }
});

// Rota para usuários online (placeholder)
app.get('/online', (req, res) => {
  res.json({ online: [] });
});

// Inicialização do servidor
if (require.main === module) {
  app.listen(5000, () => {
    console.log('Backend rodando em http://localhost:5000');
  });
}

module.exports = { app, pool };

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
app.post('/departamentos', requireAdmin, async (req, res) => {
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
app.put('/departamentos/:id', requireAdmin, async (req, res) => {
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
app.put('/departamentos/:id/inativar', requireAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE departamentos SET ativo = FALSE WHERE id = $1', [id]);
    res.json({ message: 'Departamento inativado.' });
  } catch {
    res.status(500).json({ error: 'Erro ao inativar departamento' });
  }
});
