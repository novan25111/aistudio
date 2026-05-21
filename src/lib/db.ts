import * as dotenv from 'dotenv';
import * as path from 'path';
import pg from 'pg';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
console.log("CEK ISI DATABASE_URL:", process.env.DATABASE_URL ? "TERBACA" : "KOSONG");

const { Pool } = pg;

const hasConfig = !!(process.env.DATABASE_URL || process.env.PGHOST || process.env.PGPASSWORD);

// Store DB trace logs in memory to display on UI
const dbLogs: string[] = [];
export function logDbTrace(msg: string) {
  const timestamp = new Date().toLocaleTimeString('id-ID');
  const entry = `[${timestamp}] ${msg}`;
  dbLogs.push(entry);
  console.log(`[DB_TRACE] ${msg}`);
  if (dbLogs.length > 50) {
    dbLogs.shift();
  }
}

export function getDbLogs(): string[] {
  // If empty, put an initialization message
  if (dbLogs.length === 0) {
    dbLogs.push(`[${new Date().toLocaleTimeString('id-ID')}] Database system started. Fallback storage is ready.`);
  }
  return dbLogs;
}

logDbTrace(`System initialized. Configuration: ${hasConfig ? "COMPLETE (PostgreSQL Configured)" : "INCOMPLETE (Fallback storage activated)"}`);

// Use discrete parameters option if available to prevent URL parsing errors with special chars (like '@') in password.
// Otherwise fall back to DATABASE_URL.
let poolConfig: any = {};

if (process.env.PGHOST || process.env.PGUSER || process.env.PGPASSWORD || process.env.PGDATABASE) {
  poolConfig = {
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || '',
    database: process.env.PGDATABASE || 'postgres',
  };
} else if (process.env.DATABASE_URL) {
  poolConfig = {
    connectionString: process.env.DATABASE_URL,
  };
}

let pool: pg.Pool | null = null;
let isDbConnected = false;

/**
 * Initialize PostgreSQL connection pool lazily and gracefully.
 * This prevents the application from crashing on startup if PostgreSQL is not available/reachable.
 */
export function getDbPool(): pg.Pool | null {
  if (pool) return pool;

  if (!hasConfig) {
    logDbTrace("ℹ️ PostgreSQL environment variables not fully configured. Using mock/in-memory storage fallback.");
    return null;
  }

  try {
    const isLocalhost = poolConfig.host === 'localhost' || poolConfig.host === '127.0.0.1' || (poolConfig.connectionString && poolConfig.connectionString.includes('localhost'));
    const requireSsl = process.env.PGSSLMODE === 'require' || (!isLocalhost && process.env.PGSSLMODE !== 'disable');

    logDbTrace(`Initializing pool. Target Host: ${poolConfig.host || 'DATABASE_URL'}, Database: ${poolConfig.database || 'Unspecified'}, SSL requirement resolved to: ${requireSsl ? "YES (rejectUnauthorized: false)" : "NO"}`);

    pool = new Pool({
      ...poolConfig,
      ssl: requireSsl ? { rejectUnauthorized: false } : undefined,
      connectionTimeoutMillis: 5000, // Fail fast (5s timeout)
    });

    // Handle background pool errors
    pool.on('error', (err) => {
      logDbTrace(`⚡ PostgreSQL Background Pool Error: ${err.message}`);
    });

    return pool;
  } catch (err: any) {
    logDbTrace(`❌ Failed to initialize PostgreSQL Pool: ${err.message}`);
    pool = null;
    return null;
  }
}

/**
 * Test connections and initialize table structures
 */
export async function initializeDatabase() {
  logDbTrace("Starting database initialization...");
  const activePool = getDbPool();
  if (!activePool) {
    logDbTrace("⚠️ Database initialization skipped because no pool could be constructed (Config variables missing).");
    return;
  }

  try {
    logDbTrace(`Attempting handshake with PostgreSQL server at ${poolConfig.host || 'DATABASE_URL_provided'}...`);
    const client = await activePool.connect();
    logDbTrace("✅ Successfully connected to PostgreSQL Database!");
    isDbConnected = true;

    // Create News cache table
    logDbTrace("Verifying/creating 'news' table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS news (
        id VARCHAR(100) PRIMARY KEY,
        title TEXT UNIQUE,
        source VARCHAR(100),
        source_type VARCHAR(100),
        category VARCHAR(50),
        url TEXT,
        summary TEXT,
        date VARCHAR(100),
        pub_date_str TEXT,
        impact_type VARCHAR(50),
        impact_score INTEGER,
        impacted_sectors JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    // Create Users table
    logDbTrace("Verifying/creating 'users' table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'user',
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Seed default admin user
    await client.query(`
      INSERT INTO users (username, password, role) 
      VALUES ('admin', '3motion@L', 'admin')
      ON CONFLICT (username) DO NOTHING;
    `);

    // Create Trading Plans / Market Analysis Table
    logDbTrace("Verifying/creating 'trading_plans' table...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS trading_plans (
        id SERIAL PRIMARY KEY,
        symbol VARCHAR(50) NOT NULL,
        last_price NUMERIC,
        volatility VARCHAR(50),
        score INTEGER,
        pivot NUMERIC,
        target_main NUMERIC,
        stop_loss NUMERIC,
        tranche1_entry NUMERIC,
        tranche2_breakout NUMERIC,
        tranche3_after_resistance NUMERIC,
        timestamp TIMESTAMP DEFAULT NOW()
      );
    `);

    client.release();
    logDbTrace("🎉 PostgreSQL Database Tables validated & initialized successfully.");
  } catch (err: any) {
    logDbTrace(`❌ Connection / Migration Handshake failed: ${err.message}`);
    console.error("❌ DB_TRACE_ERROR:", err.message);
    
    if (err.code === 'ECONNREFUSED' && (err.address === '127.0.0.1' || err.address === '::1' || poolConfig.host === 'localhost')) {
      logDbTrace("⚠️ DANGER / ECONNREFUSED DETECTED: You are running this app inside the AI Studio cloud sandbox!");
      logDbTrace("⚠️ Note that 'localhost' or '127.0.0.1' points to this sandbox, not your physical laptop.");
      logDbTrace("💡 Solution 1: Use a cloud-hosted DB (e.g. Supabase, Neon.tech, ElephantSQL) and paste its DATABASE_URL into your settings.");
      logDbTrace("💡 Solution 2: Download this project via ZIP, install dependencies, and run it locally on your PC so it connects to your local DB.");
    } else {
      logDbTrace(`💡 Check list: Is the DB running? Is password correct? Port 5432 open? Did you allow remote access/SSL?`);
    }
    isDbConnected = false;
  }
}

/**
 * Check if PostgreSQL is actively connected
 */
export function checkDbStatus(): boolean {
  return isDbConnected;
}

/**
 * Save multiple news items into PostgreSQL cache
 */
export async function saveNewsToDb(newsItems: any[]) {
  const activePool = getDbPool();
  if (!activePool || !isDbConnected) return;

  try {
    const client = await activePool.connect();
    for (const item of newsItems) {
      try {
        await client.query(
          `INSERT INTO news (
            id, title, source, source_type, category, url, summary, date, pub_date_str, impact_type, impact_score, impacted_sectors
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12::jsonb)
          ON CONFLICT (title) DO UPDATE SET
            summary = EXCLUDED.summary,
            impact_score = EXCLUDED.impact_score,
            impact_type = EXCLUDED.impact_type`,
          [
            item.id,
            item.title,
            item.source,
            item.sourceType,
            item.category,
            item.url,
            item.summary,
            item.date,
            item.pubDateStr,
            item.impactType,
            item.impactScore,
            JSON.stringify(item.impactedSectors || [])
          ]
        );
      } catch (innerErr) {
        // Suppress on conflicts or parse errors for individual items
      }
    }
    client.release();
  } catch (err: any) {
    console.warn("⚠️ Failed to write news to PostgreSQL:", err.message);
  }
}

/**
 * Get news items cached in PostgreSQL database
 */
export async function getNewsFromDb(limit?: number): Promise<any[] | null> {
  const activePool = getDbPool();
  if (!activePool || !isDbConnected) return null;

  try {
    let query = `SELECT * FROM news ORDER BY created_at DESC, pub_date_str DESC`;
    let params: any[] = [];
    if (limit) {
      query += ` LIMIT $1`;
      params.push(limit);
    }
    const { rows } = await activePool.query(query, params);
    
    return rows.map(r => {
      let sourceType = r.source_type;
      if (r.source === 'IDX' || r.source === 'KSEI') {
        sourceType = 'Announcement';
      }
      return {
        id: r.id,
        title: r.title,
        source: r.source,
        sourceType: sourceType,
        category: r.category,
        url: r.url,
        summary: r.summary,
        date: r.date,
        pubDateStr: r.pub_date_str,
        impactType: r.impact_type,
        impactScore: r.impact_score,
        impactedSectors: typeof r.impacted_sectors === 'string' ? JSON.parse(r.impacted_sectors) : r.impacted_sectors
      };
    });
  } catch (err: any) {
    console.warn("⚠️ Failed to read news from PostgreSQL, falling back to real-time parser:", err.message);
    return null;
  }
}

/**
 * Save Trading Plan / Analysis Result
 */
export async function saveTradingPlanToDb(plan: any) {
  const activePool = getDbPool();
  if (!activePool || !isDbConnected) return;

  try {
    const { symbol, lastPrice, volatility, score, levels } = plan;
    await activePool.query(
      `INSERT INTO trading_plans (
        symbol, last_price, volatility, score, pivot, target_main, stop_loss, tranche1_entry, tranche2_breakout, tranche3_after_resistance
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
      [
        symbol,
        lastPrice,
        volatility,
        score,
        levels?.pivot,
        levels?.targetMain,
        levels?.stopLoss,
        levels?.tranche1_Entry,
        levels?.tranche2_Breakout,
        levels?.tranche3_AfterResistance
      ]
    );
  } catch (err: any) {
    console.warn("⚠️ Failed to save trading plan to PostgreSQL:", err.message);
  }
}

/**
 * Get recent Trading Plans
 */
export async function getTradingPlansFromDb(symbol?: string, limit: number = 10): Promise<any[] | null> {
  const activePool = getDbPool();
  if (!activePool || !isDbConnected) return null;

  try {
    let querySpec = `SELECT * FROM trading_plans`;
    let params: any[] = [];
    
    if (symbol) {
      querySpec += ` WHERE symbol = $1`;
      params.push(symbol);
    }
    
    querySpec += ` ORDER BY timestamp DESC LIMIT $${params.length + 1}`;
    params.push(limit);

    const { rows } = await activePool.query(querySpec, params);
    return rows.map(r => ({
      id: r.id,
      symbol: r.symbol,
      lastPrice: parseFloat(r.last_price),
      volatility: r.volatility,
      score: r.score,
      levels: {
        pivot: parseFloat(r.pivot),
        targetMain: parseFloat(r.target_main),
        stopLoss: parseFloat(r.stop_loss),
        tranche1_Entry: parseFloat(r.tranche1_entry),
        tranche2_Breakout: parseFloat(r.tranche2_breakout),
        tranche3_AfterResistance: parseFloat(r.tranche3_after_resistance)
      },
      timestamp: r.timestamp
    }));
  } catch (err: any) {
    console.warn("⚠️ Failed to read trading plans from PostgreSQL:", err.message);
    return null;
  }
}

// In-memory fallback for users
let inMemoryUsers: any[] = [
  { id: 1, username: 'admin', password: '3motion@L', role: 'admin', created_at: new Date() }
];

export async function verifyUser(username: string, password: string): Promise<any | null> {
  const activePool = getDbPool();
  if (!activePool || !isDbConnected) {
    const memUser = inMemoryUsers.find(u => u.username === username && u.password === password);
    if (memUser) return memUser;
    return null;
  }
  
  try {
    const { rows } = await activePool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password]);
    if (rows.length > 0) return rows[0];
    return null;
  } catch (err) {
    console.warn("⚠️ Failed to verify user DB:", err);
    // Fallback if table doesn't exist yet but DB is supposedly connected
    const memUser = inMemoryUsers.find(u => u.username === username && u.password === password);
    if (memUser) return memUser;
    return null;
  }
}

export async function getUsers(): Promise<any[]> {
  const activePool = getDbPool();
  if (!activePool || !isDbConnected) {
    return inMemoryUsers;
  }

  try {
    const { rows } = await activePool.query('SELECT id, username, role, created_at FROM users ORDER BY created_at DESC');
    return rows;
  } catch (err) {
    return inMemoryUsers;
  }
}

export async function createUser(username: string, password: string, role: string = 'user'): Promise<boolean> {
  const activePool = getDbPool();
  if (!activePool || !isDbConnected) {
    if (inMemoryUsers.find(u => u.username === username)) return false;
    inMemoryUsers.push({
      id: Date.now(),
      username,
      password,
      role,
      created_at: new Date()
    });
    return true;
  }

  try {
    await activePool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      [username, password, role]
    );
    return true;
  } catch (err) {
    console.warn("⚠️ Failed to create user DB:", err);
    return false;
  }
}

export async function deleteUser(username: string): Promise<boolean> {
  // Prevent deleting admin
  if (username === 'admin') return false;

  const activePool = getDbPool();
  if (!activePool || !isDbConnected) {
    const initialLen = inMemoryUsers.length;
    inMemoryUsers = inMemoryUsers.filter(u => u.username !== username);
    return inMemoryUsers.length < initialLen;
  }

  try {
    const { rowCount } = await activePool.query('DELETE FROM users WHERE username = $1', [username]);
    // The driver returns rowCount. We assert rowCount exists.
    return (rowCount ?? 0) > 0;
  } catch (err) {
    console.warn("⚠️ Failed to delete user DB:", err);
    return false;
  }
}
