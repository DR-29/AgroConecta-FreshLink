const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración SSL para conexión cloud
const isCloud = process.env.MYSQL_HOST && !process.env.MYSQL_HOST.includes('localhost');
const sslConfig = isCloud || process.env.MYSQL_SSL === 'true'
  ? { rejectUnauthorized: false }
  : undefined;

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306', 10),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'defaultdb',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  ssl: sslConfig
});

module.exports = pool;
