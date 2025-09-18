const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const app = express();
app.use(cors());
app.use(bodyParser.json());

const port = process.env.PORT || 5000;

app.get('/', (req, res) => res.send('Stub backend OK'));

app.get('/users', (req, res) => {
  res.json({ users: [
    { id: 1, email: 'alice@ceosoftware.com.br', is_approved: true, user_type: 'analista_admin' },
    { id: 2, email: 'cliente@acme.com', is_approved: false, user_type: 'cliente' }
  ]});
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email) return res.status(400).json({ error: 'missing email' });
  // simples: qualquer senha aceita
  const token = Buffer.from(email + ':stub-token').toString('base64');
  res.json({ token });
});

app.post('/api/check-type-user', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'missing email' });
  if (/@ceosoftware\.com\.br$/i.test(email)) return res.json({ user_type: 'analista_admin' });
  return res.json({ user_type: 'cliente' });
});

app.get('/online', (req, res) => res.json({ online: [] }));
app.get('/departamentos', (req, res) => res.json({ departamentos: [ { id: 'd1', nome: 'Suporte' } ] }));

app.listen(port, () => console.log(`Dev stub backend listening on http://localhost:${port}`));
