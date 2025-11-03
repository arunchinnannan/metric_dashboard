const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client:', err);
  process.exit(-1);
});

pool.on('connect', () => {
  console.log('✅ Database connected successfully');
});

// Test database connection on startup
const testConnection = async () => {
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Database connection test successful');
  } catch (err) {
    console.error('❌ Database connection test failed:', err.message);
    throw err;
  }
};

const buildWhereClause = (filters) => {
  let conditions = [];
  let params = [];
  let paramCount = 1;

  if (filters.dateRange?.start) {
    conditions.push(`metric_date >= $${paramCount}`);
    params.push(filters.dateRange.start);
    paramCount++;
  }

  if (filters.dateRange?.end) {
    conditions.push(`metric_date <= $${paramCount}`);
    params.push(filters.dateRange.end);
    paramCount++;
  }

  if (filters.clusters?.length > 0) {
    const placeholders = filters.clusters.map(() => `$${paramCount++}`).join(',');
    conditions.push(`cluster_name IN (${placeholders})`);
    params.push(...filters.clusters);
  }

  if (filters.namespaces?.length > 0) {
    const placeholders = filters.namespaces.map(() => `$${paramCount++}`).join(',');
    conditions.push(`namespace IN (${placeholders})`);
    params.push(...filters.namespaces);
  }

  if (filters.environments?.length > 0) {
    const placeholders = filters.environments.map(() => `$${paramCount++}`).join(',');
    conditions.push(`environment IN (${placeholders})`);
    params.push(...filters.environments);
  }

  if (filters.applications?.length > 0) {
    const placeholders = filters.applications.map(() => `$${paramCount++}`).join(',');
    conditions.push(`application_name IN (${placeholders})`);
    params.push(...filters.applications);
  }

  if (filters.poolIds?.length > 0) {
    const placeholders = filters.poolIds.map(() => `$${paramCount++}`).join(',');
    conditions.push(`pool_id IN (${placeholders})`);
    params.push(...filters.poolIds);
  }

  if (filters.dataPlanes?.length > 0) {
    const placeholders = filters.dataPlanes.map(() => `$${paramCount++}`).join(',');
    conditions.push(`data_plane IN (${placeholders})`);
    params.push(...filters.dataPlanes);
  }

  if (filters.motsIds?.length > 0) {
    const placeholders = filters.motsIds.map(() => `$${paramCount++}`).join(',');
    conditions.push(`mots_id IN (${placeholders})`);
    params.push(...filters.motsIds);
  }

  return {
    whereClause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    params,
    paramCount
  };
};

module.exports = {
  pool,
  buildWhereClause,
  testConnection
};