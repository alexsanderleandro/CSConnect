const { Pool } = require('pg');

const pool = new Pool({
  connectionString: 'postgresql://postgres:SUA_SENHA@db.xvoszzjxdygtlctbgakm.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

async function testConnection() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Conexão bem-sucedida! Data/hora do banco:', res.rows[0].now);
  } catch (err) {
    console.error('Erro ao conectar:', err);
  } finally {
    await pool.end();
  }
}

testConnection();
