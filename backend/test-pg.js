const { Client } = require('pg');

const client = new Client({
  connectionString: 'postgresql://postgres:Personne33@db.pjedswmeezxqzuhbvhoo.supabase.co:5432/postgres',
  ssl: { rejectUnauthorized: false }
});

client.connect()
  .then(() => {
    console.log('✓ Connexion PostgreSQL réussie');
    return client.query('SELECT NOW()');
  })
  .then(res => {
    console.log('✓ Serveur time:', res.rows[0]);
    client.end();
  })
  .catch(err => {
    console.error('✗ Erreur:', err.message);
    client.end();
  });
