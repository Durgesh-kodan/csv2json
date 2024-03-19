const { Client } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
    host: process.env.POSTGRESDB_HOST,
    user: process.env.POSTGRESDB_USER,
    port: process.env.POSTGRESDB_PORT,
    password: process.env.POSTGRESDB_PASSWORD,
    database: process.env.POSTGRESDB_NAME
});

try {
    client.connect();
    console.log('Connected to database');
} catch (err) {
    console.error('Database connection error:', err.stack);
}

module.exports = client;
